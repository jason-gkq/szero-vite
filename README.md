### 简介

本脚本适合：`react` + `ts` + `less` 项目进行打包

#### 前置

配置package.json

```json
{
  "type": "module"
}
```

#### 安装

```
yarn add szero-scripts
```

#### 更新包

```shell
yarn upgrade szero-vite@1.*.*
yarn upgrade szero-vite --latest
```

#### 开发

```shell
yarn start
```

#### 打包

```shell
yarn build:test
yarn build:pre
yarn build:prod
```

### 开发前置准备

1. 环境介绍：所有环境可以自行添加，只要scripts中的env的值和根目录下对应配置文件存在则自动回加载该配置文件
   这里以`local`、`test`、`pre`、`prod`四个环境为例

- local 本地开发
- test 测试环境
- pre 堡垒环境
- prod 生产环境

2. 在`package.json`中添加 scripts，配置：

```json
{
  "scripts": {
    "start": "szero-vite start env=local",
    "build:test": "szero-vite build env=test",
    "build:pre": "szero-vite build env=pre",
    "build:prod": "szero-vite build env=prod"
  }
}
```

3. 根目录添加文件夹`env`，文件加重添加如下 4 个`js`文件

- env/env.com.js
- env/env.local.js
- env/env.test.js
- env/env.pre.js
- env/env.prod.js

**`env.com.js`为公共业务参数配置文件，其余为各个环境差异性配置**

4. 文件格式如下：

```js
// 配置文件中导出defineConfig则配置信息回自动加载到全局变量中
export const defineConfig = () => ({
  ENV: 'prod',
  appName: 'admin',
  viteConfig: {
    base: '/admin/',
    server: {
      host: 'localhost',
      port: 3300,
    },
    privateConfig:{
      headScripts: [
        {
          src: 'https://cdn.bootcdn.net/ajax/libs/echarts/5.4.3/echarts.common.js',
        },
      ],
      copyOptions: {
        targets: [
          {
            src: 'bin/example.wasm',
            dest: 'wasm-files'
          }
        ]
      }
    }
    build: {},
  },
});
```

必要参数配置：

- ENV 环境标识
- appName 为路由前缀
- viteConfig vite配置项，具体配置项参考[vite官方文档](https://cn.vitejs.dev/config/)

4. 项目跟目录添加`jsconfing.json`，主要用于`vscode`识别短路径，`webpack`打包会根据`compilerOptions.paths`中的配置转换为`alias`

[处理 alias 转跳问题](https://code.visualstudio.com/docs/languages/jsconfig)

```json
{
  "compilerOptions": {
    "checkJs": false,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/assets/*": ["assets/*"],
      "@/src/*": ["src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```
