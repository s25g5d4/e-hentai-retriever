import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import * as fs from 'node:fs';

const banner = fs.readFileSync('./header', 'utf8').toString();

export default {
  input: './src/index.ts',
  output: {
    file: './build/ehr.user.js',
    format: 'iife',
    banner
  },

	plugins: [
    typescript(),
    nodePolyfills(),
    postcss()
	]
}
