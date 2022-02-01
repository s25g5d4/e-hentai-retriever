import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import builtins from 'rollup-plugin-node-builtins';

import header from './src/header.js';

export default {
  input: './src/index.ts',
  output: {
    file: './build/ehr.user.js',
    format: 'iife',
    banner: header
  },

	plugins: [
    typescript(),
    builtins(),
    postcss()
	]
}
