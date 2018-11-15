import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: { file: 'lib/rxloop.js', format: 'cjs', indent: false, exports: 'named' },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true
      }),
      babel()
    ]
  },

  // ES
  {
    input: 'src/index.js',
    output: { file: 'es/rxloop.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true
      }),
      babel()
    ]
  },

  // ES for Browsers
  {
    input: 'src/index.js',
    output: { file: 'es/rxloop.mjs', format: 'es', indent: false },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
      }),
      babel(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  },

  // UMD Development
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rxloop.js',
      format: 'umd',
      name: 'rxloop',
      exports: 'named',
      indent: false
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rxloop.min.js',
      format: 'umd',
      name: 'rxloop',
      exports: 'named',
      indent: false
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
]
