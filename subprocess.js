/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

// TODO: See also execa https://github.com/sindresorhus/execa

/* eslint-disable no-sync,no-await-in-loop,no-use-before-define,no-console */
const path = require('path')
const process = require('process')
const {spawnSync} = require('child_process')


function runSync(command, args, options = {}) {
  const res = spawnSync(command, args, options)
  if (res.status !== 0) throw new Error(res.error)
  return res.stdout.toString()
}


function spawnInteractive({command, args, options = {}, allowedStatus = [0]}) {
  const res = spawnSync(command, args, {
    ...options,
    stdio: [process.stdin, process.stdout, process.stderr],
  })
  if (!allowedStatus.includes(res.status)) throw new Error(res.error)
  return res
}


function gitSync(args, options) {
  return runSync(
    '/usr/bin/git',
    args,
    options,
  )
}


function gitInteractive(args, options, allowedStatus) {
  return spawnInteractive({
    command: '/usr/bin/git',
    args,
    options,
    allowedStatus,
  })
}


function npmSync(args, options) {
  return runSync(
    '/usr/bin/npm',
    args,
    options,
  )
}


function npmInteractive({
  args,
  spawnOptions,
  options = {},
}) {
  const {
    npmCommand = '/usr/bin/npm',
    allowedStatus,
  } = options

  return spawnInteractive({
    command: npmCommand,
    args,
    options: spawnOptions,
    allowedStatus,
  })
}


function npxSync(args, options) {
  return runSync(
    '/usr/bin/npx',
    args,
    options,
  )
}


function npxInteractive(args, options, allowedStatus) {
  return spawnInteractive({
    command: '/usr/bin/npx',
    args,
    options,
    allowedStatus,
  })
}


function eslint(args, options) {
  // Also use .eslintignore files
  return npxInteractive(['eslint', ...args], options)
}


function webpackInteractive(args, env, options) {
  return npxInteractive(
    [
      'webpack',
      ...args,
      '--progress',
      ...Object.entries(env).reduce((acc, [key, val]) => acc.concat(
        [`--env.${key}`, val],
      ), []),
    ],
    options,
  )
}


function python3Interactive({venvPath, args}) {
  return spawnInteractive({
    command: path.join(venvPath, 'bin', 'python3'),
    args,
  })
}


function python2Interactive({venvPath, args}) {
  return spawnInteractive({
    command: path.join(venvPath, 'bin', 'python2'),
    args,
  })
}


function pip3({venvPath, args}) {
  return runSync(path.join(venvPath, 'bin', 'pip3'), args)
}


function pip2({venvPath, args}) {
  return runSync(path.join(venvPath, 'bin', 'pip2'), args)
}


function pip3Interactive({venvPath, args}) {
  return spawnInteractive({
    command: path.join(venvPath, 'bin', 'pip3'),
    args,
  })
}


function pip2Interactive({venvPath, args}) {
  return spawnInteractive({
    command: path.join(venvPath, 'bin', 'pip2'),
    args,
  })
}


function assertPythonVirtualEnv(venvPath) {
  const pythonPath = runSync('which', ['python'])
  if (!pythonPath.startsWith(venvPath)) {
    throw new Error('Not running in the Python virtual environment')
  }
  return true
}


function gcloudJson({project, args}) {
  // TODO[setup]: gcloud can also be used through Node
  //   https://cloud.google.com/nodejs/docs/reference/libraries
  const res = runSync(
    '/usr/bin/gcloud',
    args.concat(`--project=${project}`, '--format=json'),
  )
  return JSON.parse(res)
}


function gcloudInteractive({project, verbose, args}) {
  args.push(`--project=${project}`)

  if (verbose) {
    args.push('--verbosity=debug')
  }

  // TODO[setup]: gcloud can also be used through Node
  //   https://cloud.google.com/nodejs/docs/reference/libraries
  return spawnInteractive({
    command: '/usr/bin/gcloud',
    args,
    options: {shell: true},
  })
}


function firebaseInteractive(args, firebaseOptions = {}, processOptions) {
  if ('project' in firebaseOptions) {
    args.push('--project', firebaseOptions.project)
  }
  return npxInteractive(['firebase', ...args], processOptions)
}


module.exports = {
  runSync,
  spawnInteractive,
  gitSync,
  gitInteractive,
  npmSync,
  npmInteractive,
  npxSync,
  npxInteractive,
  eslint,
  webpackInteractive,
  python3Interactive,
  python2Interactive,
  pip3,
  pip2,
  pip3Interactive,
  pip2Interactive,
  assertPythonVirtualEnv,
  gcloudJson,
  gcloudInteractive,
  firebaseInteractive,
}
