'use strict';
import fs from 'fs';
// import path from 'path';
import paths from './paths';

let comDefineConfig = () => ({});
if (fs.existsSync(`${paths.env}/env.com.js`)) {
  const { defineConfig } = await import(`file://${paths.env}/env.com.js`);
  comDefineConfig = defineConfig;
}

let envDefineConfig = () => ({});
if (fs.existsSync(`${paths.appEnvConfig}`)) {
  const { defineConfig } = await import(`file://${paths.appEnvConfig}`);
  envDefineConfig = defineConfig;
}

export function getClientEnvironment() {
  const raw: any = Object.keys(process.env).reduce((env, key) => {
    if (
      [
        'author',
        'BABEL_ENV',
        'NODE_ENV',
        'BUILD_ENV',
        'LANG',
        'npm_package_name',
        'LaunchInstanceID',
        'npm_package_version',
        'npm_lifecycle_event',
        'npm_lifecycle_script',
        'npm_package_main',
        'npm_package_type',
        'publicUrlOrPath',
      ].includes(key)
    ) {
      env[key] = process.env[key];
    }
    return env;
  }, {});

  let productConfig: any = {
    ENV: process.env.BUILD_ENV,
    buildTime: new Date().getTime(),
    ...comDefineConfig(),
    ...envDefineConfig(),
  };
  if (fs.existsSync(`${paths.appPackageJson}`)) {
    const packageJsonContent = fs.readFileSync(paths.appPackageJson, 'utf-8');
    const { author, version } = JSON.parse(packageJsonContent);
    productConfig.author = author;
    productConfig.version = version;
  }
  raw.productConfig = productConfig;
  // Stringify all values so we can feed into webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      if (key == 'productConfig') {
        const { webpackConfig, viteConfig, ...restValue } = raw[key];
        env[key] = restValue;
      } else {
        env[key] = raw[key];
      }
      return env;
    }, {}),
  };
  return { raw, stringified };
}

export function getAlias() {
  const alias = {};
  if (fs.existsSync(paths.appTsConfig)) {
    const appTsConfig = fs.readFileSync(paths.appTsConfig, 'utf-8');
    const { compilerOptions } = JSON.parse(appTsConfig);
    Object.keys(compilerOptions.paths || {}).forEach((key) => {
      if (/\/$/.test(compilerOptions.paths[key])) {
        alias[key.trim().slice(0, -1)] =
          paths.appPath +
          '/' +
          compilerOptions.paths[key][0].trim().slice(0, -1);
      } else if (/\/\*$/.test(compilerOptions.paths[key])) {
        alias[key.trim().slice(0, -2)] =
          paths.appPath +
          '/' +
          compilerOptions.paths[key][0].trim().slice(0, -2);
      } else {
        alias[key] = paths.appPath + '/' + compilerOptions.paths[key][0].trim();
      }
    });
  }
  return alias;
}
