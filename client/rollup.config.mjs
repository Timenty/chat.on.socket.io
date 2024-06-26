import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import { spawn } from 'child_process';

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
        stylus: {
          includePaths: ['src/styles'],
        },
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
      port: 35729  // Убедитесь, что порт совпадает с тем, который использует LiveReload
    }),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
