import { createFilter } from '@rollup/pluginutils';
import paths from '../paths';

export default function transformImport() {
  // const filter = createFilter('src/**/*.tsx', 'node_modules/**/*');
  const filter = createFilter(`node_modules/**`);
  return {
    name: 'vite-plugin-transform-import',
    transform(code, id) {
      if (!filter(id) || !code.includes('@/src')) return;
      // return code.replace('@/src', paths.appSrc);
      return code.replace('@/src', '/src');
      // return {
      //   code: code.replace('@/src', path.resolve(__dirname, 'src')),
      //   map: null, // 如果可行将提供 source map
      // };
    },
  };
}
