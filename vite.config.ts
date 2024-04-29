// import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import htmlTemplate from 'vite-plugin-html-template-mpa';
import transformImport from './lib/vite-plugin-transform-import';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import topLevelAwait from 'vite-plugin-top-level-await';

import paths from './paths';
import { getClientEnvironment, getAlias } from './env';

/**
 * vite-plugin-compression  使用 gzip 或者 brotli 来压缩资源
 * vite-plugin-imagemin  打包压缩图片 在windows上会报错；
 */

const { raw, stringified } = getClientEnvironment();
const { productConfig = {} } = raw;
const { viteConfig = {}, layout = {}, appName } = productConfig;
const {
  server,
  base,
  build = {},
  privateConfig,
  plugins = [],
  css = {},
  resolve = {},
  ...restViteConfig
} = viteConfig;

const { headScripts = [], copyOptions } = privateConfig || {};

// viteStaticCopy({
//   targets: [
//     {
//       src: 'bin/example.wasm',
//       dest: 'wasm-files'
//     }
//   ]
// })

// rollup插件 https://github.com/rollup/awesome?tab=readme-ov-file
// vite插件 https://github.com/vitejs/awesome-vite#plugins
// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  // const env = loadEnv(mode, process.cwd(), '');

  const commonConfig = {
    define: {
      ...stringified,
    },
    // root: path.resolve(__dirname, '..'),
    root: paths.appPath,
    plugins: [
      react({
        jsxRuntime: 'classic',
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
          ],
        },
      }),
      viteTsconfigPaths(),
      htmlTemplate({
        template: paths.appHtml,
        // pagesDir: 'src/pages',
        entry: 'src/index.tsx',
        inject: {
          data: {
            htmlWebpackPlugin: {
              options: {
                defaultTitle: layout.title,
                appName: appName,
                headScripts: headScripts,
              },
            },
          },
        },
      }),
      copyOptions && viteStaticCopy(copyOptions),
      transformImport(),
      topLevelAwait({
        // The export name of top-level await promise for each chunk module
        promiseExportName: '__tla',
        // The function to generate import names of top-level await promise in each chunk module
        promiseImportName: (i) => `__tla_${i}`,
      }),
      ...plugins,
    ].filter(Boolean),
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
      ...css,
    },
    resolve: {
      alias: getAlias(),
      ...resolve,
    },
  };

  if (command === 'serve') {
    return {
      server,
      base: '/',
      mode: 'development',
      ...commonConfig,
      ...restViteConfig,
    };
  } else {
    return {
      build: {
        outDir: 'dist', // 指定输出路径（相对于 项目根目录).
        // assetsDir: '', // 指定生成静态资源的存放路径（相对于 build.outDir）。在 库模式 下不能使用
        assetsInlineLimit: '4096', // 小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项。
        chunkSizeWarningLimit: 500,
        sourcemap: false,
        // sourcemap: '', // boolean | 'inline' | 'hidden'
        // manifest: '', // 包含了没有被 hash 过的资源文件名和 hash 后版本的映射
        // minify: '', // boolean | 'terser' | 'esbuild' 默认： 'esbuild' 设置为 'terser' 时必须先安装 Terser  npm add -D terser
        // terserOptions: {},
        // copyPublicDir: '', // 默认情况下，Vite 会在构建阶段将 publicDir 目录中的所有文件复制到 outDir 目录中。可以通过设置该选项为 false 来禁用该行为。
        // rollupOptions: {},
        ...build,
      },
      base: paths.publicUrlOrPath, // 开发或生产环境服务的公共基础路径
      mode: 'production', // 默认： 'development' 用于开发，'production' 用于构建
      ...commonConfig,
      ...restViteConfig,
    };
  }
});
