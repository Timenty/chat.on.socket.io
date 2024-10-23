import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import { spawn } from 'child_process';
import fs from 'fs';
import * as sass from 'sass';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

// Compile global SCSS
const globalScss = sass.compile('src/styles/global.scss', {
  style: production ? 'compressed' : 'expanded'
});
fs.writeFileSync('public/global.css', globalScss.css);

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'esm',
    name: 'app',
    dir: 'public/build/',
    chunkFileNames: '[name].js'
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
        postcss: true,
        scss: {
          prependData: '@use "src/styles/global.scss" as *;'
        }
      }),
      compilerOptions: {
        dev: !production
      }
    }),
    css({
      output: 'bundle.css'
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production
    }),
    !production && serve(),
    !production && livereload({
      watch: 'public',
      port: 35729
    }),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
