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


function linkSelf({cwd, ask, npmCommand}) {
  // eslint-disable-next-line global-require
  const {name} = require(path.resolve(cwd, 'package.json'))

  if (ask) {
    if (!readlineSync.keyInYN(`Locally link ${name} ?`)) {
      return false
    }
  } else {
    console.log(`Ensuring that ${name} is linked locally...`)
  }

  npmInteractive({
    args: ['link'],
    spawnOptions: {cwd},
    options: {npmCommand},
  })
  npmInteractive({
    args: ['link', name],
    spawnOptions: {cwd},
    options: {npmCommand},
  })

  return true
}


function linkDependencies({cwd, regExps, ask, recurse, npmCommand}) {
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
        if (regExps.some((regExp) => regExp.test(dep))) {
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
      npmInteractive({
        args: ['link', dep],
        spawnOptions: {cwd},
        options: {npmCommand},
      })

      if (recurse) {
        // Ensure that the @kynikos dependencies are npm-linked also
        // *recursively* in the dependencies themselves
        linkDependencies({
          // Don't use __dirname here instead of cwd
          cwd: fs.realpathSync(path.resolve(cwd, 'node_modules', dep)),
          regExps,
          ask,
          recurse,
        })
      }
    }
  }

  return true
}


function maintainPackageDependencies(cwd, {
  regExpsToLink = [],
  recursiveLinks = false,
  npmCommand,
}) {
  console.log('Checking outdated dependencies in', cwd, '...')

  const outdated = npmInteractive({
    args: ['outdated'],
    spawnOptions: {cwd},
    options: {allowedStatus: [0, 1], npmCommand},
  })

  if (outdated.status === 0) {
    console.log('All dependencies are up to date')
  } else if (readlineSync.keyInYN('Update all dependencies?')) {
    npmInteractive({
      args: ['update'],
      spawnOptions: {cwd},
      options: {npmCommand},
    })
    console.log('Running audit fix...')
    npmInteractive({
      args: ['audit', 'fix'],
      spawnOptions: {cwd},
      options: {npmCommand},
    })
    console.log('Running prune...')
    npmInteractive({
      args: ['prune'],
      spawnOptions: {cwd},
      options: {npmCommand},
    })
    console.log('Running dedupe...')
    npmInteractive({
      args: ['dedupe'],
      spawnOptions: {cwd},
      options: {npmCommand},
    })
  }

  linkDependencies({
    cwd,
    regExps: regExpsToLink,
    ask: true,
    recurse: recursiveLinks,
  })
}


module.exports = {
  linkSelf,
  linkDependencies,
  maintainPackageDependencies,
}
