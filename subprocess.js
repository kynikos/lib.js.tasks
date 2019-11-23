/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */


 /* eslint-disable no-sync,no-await-in-loop,no-use-before-define,no-console */
const process = require('process')
const {spawnSync} = require('child_process')


function _runSync(command, args, options = {}) {
  const res = spawnSync(command, args, options)
  if (res.status !== 0) throw new Error(res.error)
  return res.stdout.toString()
}


function _spawnInteractive({command, args, options = {}, allowedStatus = [0]}) {
  const res = spawnSync(command, args, {
    ...options,
    stdio: [process.stdin, process.stdout, process.stderr],
  })
  if (!allowedStatus.includes(res.status)) throw new Error(res.error)
  return res
}


function npmInteractive(args, options, allowedStatus) {
  return _spawnInteractive({
    command: '/usr/bin/npm',
    args,
    options,
    allowedStatus,
  })
}


function npxInteractive(args, options) {
  return _spawnInteractive({command: '/usr/bin/npx', args, options})
}


function webpackInteractive(...args) {
  return npxInteractive(['webpack', ...args, '--progress'], {cwd: 'client'})
}


function gcloudJson(...args) {
  // TODO[setup]: gcloud can also be used through Node
  //   https://cloud.google.com/nodejs/docs/reference/libraries
  const res = _runSync('/usr/bin/gcloud', args.concat('--format=json'))
  return JSON.parse(res)
}


function gcloudInteractive(...args) {
  // TODO[setup]: gcloud can also be used through Node
  //   https://cloud.google.com/nodejs/docs/reference/libraries
  return _spawnInteractive({command: '/usr/bin/gcloud', args})
}


function firebaseInteractive(args, options) {
  return npxInteractive(['firebase', ...args], options)
}


module.exports = {
  npmInteractive,
  npxInteractive,
  webpackInteractive,
  gcloudJson,
  gcloudInteractive,
  firebaseInteractive,
}
