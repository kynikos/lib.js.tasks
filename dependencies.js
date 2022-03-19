/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

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


function _findLocalDeps(cwd, regExps) {
  const {
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies,
    workspaces,
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

  if (workspaces) {
    for (const workspace of workspaces) {
      localDeps.push(..._findLocalDeps(
        path.resolve(cwd, workspace),
        regExps,
      ))
    }
  }

  return localDeps
}


function _findLinkDirs(cwd, localDeps) {
  let shouldLink = false
  // Do not collect the depDirs directly here, because some may not be linked
  // yet, so I have to collect them after running 'npm link'
  const linkDirs = []

  for (const dep of localDeps) {
    // Do *not* use __dirname here instead of cwd
    const linkDir = path.resolve(cwd, 'node_modules', dep)
    const depDir = fs.realpathSync(linkDir)
    // Do not collect the depDirs directly here, because some may not be
    // linked yet, so I have to collect them after running 'npm link'
    linkDirs.push(linkDir)

    // If linkDir === depDir it means that the directory is not a link yet, so
    // the dependencies must be relinked
    if (linkDir === depDir) {
      shouldLink = true
      // Do not break, I still need to collect *all* the depDirs
    }
  }

  return [linkDirs, shouldLink]
}


function _npmLink({cwd, localDeps, npmCommand}) {
  try {
    npmInteractive({
      // I have to link all dependencies with the same 'npm link ...'
      // command, or the subsequent ones will unlink the previously
      // linked dependencies; i.e. do *not* run a 'npm link dep' command for
      // each dependency in a loop
      // BUG[upstream]: Is it an upstream bug?
      args: ['link', ...localDeps],
      spawnOptions: {cwd},
      options: {npmCommand},
    })
  } catch (error) {
    console.error(`Some of ${localDeps.join(', ')} may not be ` +
      "symlinked to the global folder: run 'npm link' from their " +
      'source folders')
    throw error
  }
}


function linkDependencies({cwd, regExps, ask, recurse, npmCommand}) {
  const localDeps = _findLocalDeps(cwd, regExps)

  if (localDeps.length) {
    if (ask) {
      if (!readlineSync.keyInYN(`Locally link ${localDeps.join(', ')} ?`)) {
        return false
      }
    } else {
      console.log(`Ensuring that ${localDeps.join(', ')} are linked locally...`)
    }

    const [linkDirs, shouldLink] = _findLinkDirs(cwd, localDeps)

    if (shouldLink) {
      _npmLink({cwd, localDeps, npmCommand})
    }

    for (const linkDir of linkDirs) {
      // Find the link target again after running 'npm link'
      const depDir = fs.realpathSync(linkDir)

      if (recurse) {
        // Ensure that the @kynikos dependencies are npm-linked also
        // *recursively* in the dependencies themselves
        linkDependencies({
          cwd: depDir,
          regExps,
          ask,
          recurse,
          npmCommand,
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
    npmCommand,
  })
}


module.exports = {
  linkSelf,
  linkDependencies,
  maintainPackageDependencies,
}
