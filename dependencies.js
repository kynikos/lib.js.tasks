/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

 /* eslint-disable no-sync,no-await-in-loop,no-use-before-define,no-console */
const fs = require('fs')
const path = require('path')
const readlineSync = require('readline-sync')
const {
  npmInteractive,
} = require('./subprocess')


function linkDependencies({cwd, prefixes, ask, recurse}) {
  const {
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies,
    // eslint-disable-next-line global-require
  } = require(path.resolve(cwd, 'package.json'))

  const localDeps = [
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies,
  ].reduce((acc, deps) => {
    if (deps) {
      for (const dep of Object.keys(deps)) {
        if (prefixes.some((prefix) => dep.startsWith(prefix))) {
          acc.push(dep)
        }
      }
    }
    return acc
  }, [])

  if (localDeps.length) {
    if (ask) {
      if (!readlineSync.keyInYN(`Locally link ${localDeps.join(', ')} ?`)) {
        return false
      }
    } else {
      console.log(`Ensuring that ${localDeps.join(', ')} are linked locally...`)
    }

    for (const dep of localDeps) {
      npmInteractive(['link', dep], {cwd})

      if (recurse) {
        // Ensure that the @kynikos dependencies are npm-linked also
        // *recursively* in the dependencies themselves
        linkDependencies({
          // Don't use __dirname here instead of cwd
          cwd: fs.realpathSync(path.resolve(cwd, 'node_modules', dep)),
          prefixes,
          ask,
          recurse,
        })
      }
    }
  }

  return true
}


function maintainPackageDependencies(cwd, prefixesToLink, recursiveLinks) {
  console.log('Checking outdated dependencies in', cwd, '...')

  const outdated = npmInteractive(['outdated'], {cwd}, [0, 1])

  if (outdated.status === 0) {
    console.log('All dependencies are up to date')
  } else if (readlineSync.keyInYN('Update all dependencies?')) {
    npmInteractive(['update'], {cwd})
    console.log('Running audit fix...')
    npmInteractive(['audit', 'fix'], {cwd})
    console.log('Running prune...')
    npmInteractive(['prune'], {cwd})
    console.log('Running dedupe...')
    npmInteractive(['dedupe'], {cwd})
  }

  linkDependencies({
    cwd,
    prefixes: prefixesToLink,
    ask: true,
    recurse: recursiveLinks,
  })
}


module.exports = {
  linkDependencies,
  maintainPackageDependencies,
}
