import checker from 'vite-plugin-checker'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

import * as fs from 'fs'
import * as path from 'path'

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relative: string) => path.resolve(appDirectory, relative)
const root = path.resolve(__dirname, resolveApp('src'))

import wasm from 'vite-plugin-wasm'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isProduction = env.VITE_APP_ENVIRONMENT === 'production'
  const isDevelopment = env.VITE_APP_ENVIRONMENT === 'development'
  const isAnalyze = env.VITE_APP_ENVIRONMENT === 'analyze'
  const buildVersion = env.VITE_APP_BUILD_VERSION

  return {
    server: {
      port: Number(env.VITE_PORT),
    },
    commonjsOptions: {
      esmExternals: true
    },
    publicDir: 'static',
    plugins: [
      vue(),
      wasm(),
      checker({
        overlay: {
          initialIsOpen: false,
        },
        typescript: true,
        eslint: {
          lintCommand:
            'eslint "{src,config}/**/*.{vue,js,ts}" --cache --max-warnings=0',
        },
      }),
      ...(isAnalyze
        ? [
            visualizer({
              open: true,
            }),
          ]
        : []),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "@/styles/_functions.scss";
          @import "@/styles/_mixins.scss";
        `,
        },
      },
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      dedupe: ['vue'],
      alias: {
        '@': `${root}/`,
        '@config': `${root}/config.ts`,
        '@static': `${root}/../static`,
        events: 'events-polyfill',
        buffer: 'buffer/index.js',
      },
    },
    optimizeDeps: {
      exclude: ['@syntect/wasm'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeModulesPolyfillPlugin(),
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
        ],
      },
    },
  }
})
