import path from 'path'
import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const name = path.basename(packageDir)
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
const globalName = {
  core: 'rxloop',
  loading: 'rxloopLoading',
  immer: 'rxloopImmer',
  devtools: 'rxloopDevtools',
};
// const packageOptions = pkg.buildOptions || {}

// import pkg from './package.json'

export default [
  // CommonJS
  {
    input: `${packageDir}/src/index.js`,
    output: { file: `${packageDir}/lib/${name}.js`, format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        mainFields: ['jsnext', 'main'],
        // jsnext: true,
        // main: true
      }),
      
      babel(),
      commonjs(), // immer
    ]
  },

  // ES
  {
    input: `${packageDir}/src/index.js`,
    output: { file: `${packageDir}/es/${name}.js`, format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        // mainFields: ['jsnext', 'main'],
        // jsnext: true,
        // main: true
      }),
      babel(),
      commonjs(), // immer
    ]
  },

  // ES for Browsers
  {
    input: `${packageDir}/src/index.js`,
    output: { file: `${packageDir}/es/${name}.mjs`, format: 'es', indent: false },
    plugins: [
      nodeResolve({
        mainFields: ['jsnext', 'main'],
        // jsnext: true,
        // main: true
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
    input: `${packageDir}/src/index.js`,
    output: {
      file: `${packageDir}/dist/${name}.js`,
      format: 'umd',
      name: globalName[name],
      exports: 'named',
      indent: false,
    },
    plugins: [
      nodeResolve({
        mainFields: ['jsnext', 'main'],
        // jsnext: true,
        // main: true
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
    input: `${packageDir}/src/index.js`,
    output: {
      file: `${packageDir}/dist/${name}.min.js`,
      format: 'umd',
      name: globalName[name],
      exports: 'named',
      indent: false,
    },
    plugins: [
      nodeResolve({
        mainFields: ['jsnext', 'main'],
        // jsnext: true,
        // main: true
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
