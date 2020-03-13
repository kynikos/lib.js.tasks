/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */
/* eslint-disable no-sync,no-await-in-loop,no-use-before-define,no-console */
const {oneLine: L} = require('common-tags')
// TODO: minimist is a simpler alternative to commander.js
const commander = require('commander')


// eslint-disable-next-line complexity
function wrapCommander({
  init,
  maintainDependencies,
  lint,
  build,
  runTests,
  todo,
  docs,
  setupPkg,
  makePkg,
  installPkg,
  publishToNpm,
  publishToAur,
  release,
}) {
  if (init == null) {
    throw new Error("'init' not defined")
  } else if (init) {
    commander
      .command('init')
      .description('initialize the repository, e.g. right after cloning it')
      .action(() => init())
  }

  if (maintainDependencies == null) {
    throw new Error("'maintainDependencies' not defined")
  } else if (maintainDependencies) {
    commander
      .command('deps')
      .description('run semi-automated dependency maintenance operations')
      .option('-r, --reset', 'reinstall all dependencies from scratch')
      .action(({reset}) => maintainDependencies({reset}))
  }

  if (lint == null) {
    throw new Error("'lint' not defined")
  } else if (lint) {
    commander
      .command('lint')
      .description('lint the source code')
      .action(() => lint())
  }

  if (build == null) {
    throw new Error("'build' not defined")
  } else if (build) {
    commander
      .command('build')
      .description('build the application')
      .option('-p, --production', 'build in production mode')
      .action(({production}) => build({production}))
  }

  if (runTests == null) {
    throw new Error("'runTests' not defined")
  } else if (runTests) {
    commander
      .command('test [REGEX]')
      .description(L`run the automated tests; optionally only run tests with a name
        that matches REGEX`)
      .option('-v, --verbose', 'display all individual test results')
      .option('-c, --print-console', 'let tests print messages through the console')
      .option('-p, --print-received', L`print received test values for debugging
        or updating the expected values after changing the tests (it implies
        --print-console)`)
      .option('-u, --update-expected', L`overwrite the expected test files with the
        received values, useful after changing the tests`)
      // eslint-disable-next-line jest/require-top-level-describe,jest/no-disabled-tests,jest/expect-expect,jest/valid-title
      .action((regex, {verbose, printConsole, printReceived, updateExpected}) => {
        runTests({
          testNameRegex: regex,
          verbose,
          printConsole,
          printReceived,
          updateExpected,
        })
      })
  }

  if (todo == null) {
    throw new Error("'todo' not defined")
  } else if (todo) {
    commander
      .command('todo')
      .description('regenerate the TODO report')
      .option('-l, --label-only', 'exclude todo comments without a label')
      .action(({labelOnly}) => todo({labelOnly}))
  }

  if (docs == null) {
    throw new Error("'docs' not defined")
  } else if (docs) {
    commander
      .command('docs')
      .description('build the documentation')
      .action(() => docs())
  }

  if (setupPkg == null) {
    throw new Error("'setupPkg' not defined")
  } else if (setupPkg) {
    commander
      .command('pkg-setup')
      .description('set up the PKGBUILD file')
      .action(() => setupPkg())
  }

  if (makePkg == null) {
    throw new Error("'makePkg' not defined")
  } else if (makePkg) {
    commander
      .command('pkg-make')
      .description('make the PKGBUILD file')
      .action(() => makePkg())
  }

  if (installPkg == null) {
    throw new Error("'installPkg' not defined")
  } else if (installPkg) {
    commander
      .command('pkg-install')
      .description('install the Pacman tarball')
      .option('--pkgrel <NUMBER>', "set the 'pkgrel' number", 1)
      .action(({pkgrel}) => installPkg({pkgrel}))
  }

  if (publishToNpm == null) {
    throw new Error("'publishToNpm' not defined")
  } else if (publishToNpm) {
    commander
      .command('pub-npm')
      .description('publish the package to the NPM repository')
      .action(() => publishToNpm())
  }

  if (publishToAur == null) {
    throw new Error("'publishToAur' not defined")
  } else if (publishToAur) {
    commander
      .command('pub-aur')
      .description('publish the package to the AUR repository')
      .action(() => publishToAur())
  }

  if (release == null) {
    throw new Error("'release' not defined")
  } else if (release) {
    commander
      .command('release')
      .description('build and release the application')
      .action(() => release())
  }

  return commander
}


module.exports = {
  wrapCommander,
}
