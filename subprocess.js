/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

// TODO: See also execa https://github.com/sindresorhus/execa

/* eslint-disable no-sync,no-await-in-loop,no-use-before-define,no-console */
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


function npmInteractive(args, options, allowedStatus) {
  return spawnInteractive({
    command: '/usr/bin/npm',
    args,
    options,
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


function webpackInteractive(args, options) {
  return npxInteractive(['webpack', ...args, '--progress'], options)
}


function gcloudJson(...args) {
  // TODO[setup]: gcloud can also be used through Node
  //   https://cloud.google.com/nodejs/docs/reference/libraries
  const res = runSync('/usr/bin/gcloud', args.concat('--format=json'))
  return JSON.parse(res)
}


function gcloudInteractive(...args) {
  // TODO[setup]: gcloud can also be used through Node
  //   https://cloud.google.com/nodejs/docs/reference/libraries
  return spawnInteractive({command: '/usr/bin/gcloud', args})
}


function firebaseInteractive(args, options) {
  return npxInteractive(['firebase', ...args], options)
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
  gcloudJson,
  gcloudInteractive,
  firebaseInteractive,
}
