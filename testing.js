/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

const {npxInteractive} = require('./subprocess')


function jest({
  testNamePattern,
  verbose,
  printConsole,
  printReceived,
  updateExpected,
}) {
  if (printReceived) {
    // eslint-disable-next-line no-process-env
    process.env[printReceived] = 'true'
  }
  if (updateExpected) {
    // eslint-disable-next-line no-process-env
    process.env[updateExpected] = 'true'
  }

  const args = [
    'jest',
    `--silent=${printConsole || printReceived ? 'false' : 'true'}`,
  ]

  if (verbose) args.push('--verbose')
  if (testNamePattern) args.push('--testNamePattern', testNamePattern)

  npxInteractive(args)
}


module.exports = {
  jest,
}
