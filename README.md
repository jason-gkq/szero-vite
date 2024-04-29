### 简介

此脚本为`vite`打包脚本，适合`react` + `less` 的项目；

### 安装（请使用最新版本）：

```sh
npm install szero-vite
```

### 使用

- 配置`package.json`

```json
{
  "type": "module"
}
```

- #### `alias` 短路径配置
  项目跟目录添加`tsconfing.json`，打包会根据`compilerOptions.paths`中的配置转换为`alias`
  参考：

```json
{
  "compilerOptions": {
    "paths": {
      "@/src/*": ["src/*"]
    }
  }
}
```

- #### 开发、打包及配置文件关系
  `package.json`中的`scripts`所带变量`env`对应的值和根目录下`env`中的配置文件是一一对应关系，例如：`env=${变量}` 则新增配置文件：`env/env.${变量}.js`，其中`env.com.js`为公共配置文件；
  区分环境配置方法：
  在`package.json`中配置：

```json
{
  "scripts": {
    "start": "szero-vite start env=local",
    "build:test": "szero-vite build env=test",
    "build:prod": "szero-vite build env=prod"
  }
}
```

随之在根目录中新增配置文件：

```
env/env.com.js;
env/env.local.js;
env/env.test.js;
env/env.prod.js;
```

如果无需环境区分，则直接在 `package.json` 中添加如下配置：

```json
{
  "type": "module",
  "scripts": {
    "start": "szero-vite start",
    "build:prod": "szero-vite build"
  }
}
```

项目根目录中新增配置文件：`env/env.com.js`

**因com是公共配置文件，所以有相同配置项的情况下，指定环境的配置文件会覆盖com中相同变量的值，做的是浅合并，请注意；**

- #### 项目入口：`/src/index.tsx`；此项为固定值，暂不支持更改；

## 配置文件

- #### `env.com.js`以及其他配置文件配置方法：
  需在 文件中导出方法`defineConfig`，例如：

```js
export const defineConfig = () => ({
  ENV: 'prod',
});
```

### 必配变量介绍：

- #### `appName`

  主要用于`html`中项目挂载节点的替换，`react`默认是`root`，为避免项目微前端根节点问题，可用`appName`替换；

- #### `layout.title`

  浏览器默认标题

- #### `viteConfig` `vite`配置项，具体配置项参考[vite官方文档](https://cn.vitejs.dev/config/)

  主要用于`viteConfig`配置，可自行扩展；
  例如：

  ```js
  export const defineConfig = () => ({
    viteConfig: {
      base: '/web/', // 项目部署路径
      server: {
        host: 'localhost',
        port: 8800, // 项目启动端口
        // preTransformRequests: false,
        proxy: {
          // 代理配置
          '/gateway': {
            target: 'http://**.**.**.**:****',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/gateway/, ''),
          },
        },
      },
    },
  });
  ```

- #### `viteConfig.privateConfig.copyOptions`

  参考 vite-plugin-static-copy
  例如：

  ```js
  export const defineConfig = () => ({
    viteConfig: {
      privateConfig: {
        viteStaticCopy({
          targets: [{
            src: 'bin/example.wasm',
            dest: 'wasm-files'
          }]
        })
      }
    }
  });

  ```

- #### `viteConfig.privateConfig.headScripts`

  需要注入的js脚本等

  ```js
  export const defineConfig = () => ({
    viteConfig: {
      privateConfig: {
        headScripts: [
          {
            src: 'https://cdn.bootcdn.net/ajax/libs/echarts/5.4.3/echarts.common.js',
          },
        ],
      },
    },
  });
  ```

---

完整示例：

1. `env/env.com.js`：

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

2. `tsconfig.json`

```json
{
  "compilerOptions": {
    "checkJs": false,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/src/*": ["src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

3. `package.json`

```json
{
  "type": "module",
  "scripts": {
    "start": "szero-vite start env=local",
    "build:test": "szero-vite build env=test",
    "build:prod": "szero-vite build env=prod"
  }
}
```
