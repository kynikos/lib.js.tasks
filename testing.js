/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */
/* eslint-disable no-process-env */

const {npxInteractive} = require('./subprocess')


function jest({
  testNamePattern,
  verbose,
  printConsole,
  printReceived,
  updateExpected,
  env = {},
}) {
  const args = [
    'jest',
    `--silent=${printConsole || printReceived ? 'false' : 'true'}`,
  ]

  if (verbose) args.push('--verbose')
  if (testNamePattern) args.push('--testNamePattern', testNamePattern)

  if (printReceived) env[printReceived] = 'true'
  if (updateExpected) env[updateExpected] = 'true'

  return npxInteractive(args, {env: {...env, ...process.env}})
}


module.exports = {
  jest,
}
