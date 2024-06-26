'use strict';

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

let publicUrlOrPath = '/';

const envComFilePath = `${resolveApp('env')}/env.com.js`;
const envFilePath = `${resolveApp('env')}/env.${process.env.BUILD_ENV}.js`;

if (fs.existsSync(envComFilePath)) {
  const { defineConfig } = await import(`file://${envComFilePath}`);
  const { viteConfig } = defineConfig && defineConfig();
  const { base: publicUrlOrPathC } = viteConfig || {};
  if (publicUrlOrPathC) {
    publicUrlOrPath = publicUrlOrPathC;
  }
}

if (fs.existsSync(envFilePath)) {
  const { defineConfig } = await import(`file://${envFilePath}`);
  const { viteConfig } = defineConfig && defineConfig();
  const { base: publicUrlOrPathC } = viteConfig || {};
  if (publicUrlOrPathC) {
    publicUrlOrPath = publicUrlOrPathC;
  }
}

process.env.publicUrlOrPath = publicUrlOrPath;

const buildPath = 'dist';

export const moduleFileExtensions = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'css',
  'less',
  'json',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`)),
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

const resolveOwn = (relativePath) =>
  path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/react-scripts/config/
export default {
  env: resolveApp('env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appEnvConfig: resolveApp(`env/env.${process.env.BUILD_ENV}.js`),
  // testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  // proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  swSrc: resolveModule(resolveApp, 'src/serviceWorker'),
  publicUrlOrPath,
  // These properties only exist before ejecting:
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
  appTypeDeclarations: resolveApp('src/global.d.ts'),
};
