/*
```
yarn build core loading immer devtools
```
*/

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const args = require('minimist')(process.argv.slice(2))

const targets = args._
// const formats = args.formats || args.f
const devOnly = args.devOnly || args.d
// const prodOnly = !devOnly && (args.prodOnly || args.p)
// const buildAllMatching = args.all || args.a
// const lean = args.lean || args.l
// const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

run()
async function run() {
  await buildAll(targets);
  // if (!targets.length) {
    
  //   await buildAll(targets);
  //   // checkAllSizes(allTargets)
  // }
  // else {
  //   await buildAll(fuzzyMatchTarget(targets, buildAllMatching))
  //   checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching))
  // }
}

async function buildAll(targets) {
  for (const target of targets) {
    await build(target)
  }
}

// async function buildAll() {
//   await build('devtools');
//   console.log(targets);
// }

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`)
  const pkg = require(`${pkgDir}/package.json`)

  await fs.remove(`${pkgDir}/lib`)
  await fs.remove(`${pkgDir}/es`)
  await fs.remove(`${pkgDir}/dist`)
  

  const env =
    (pkg.buildOptions && pkg.buildOptions.env) ||
    (devOnly ? 'development' : 'production')

  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        // `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        // formats ? `FORMATS:${formats}` : ``,
        // args.types ? `TYPES:true` : ``,
        // prodOnly ? `PROD_ONLY:true` : ``,
        // lean ? `LEAN:true` : ``
      ]
        .filter(Boolean)
        .join(',')
    ],
    { stdio: 'inherit' }
  )
}