/* eslint-disable no-sync,no-await-in-loop,no-use-before-define,no-console */
const {oneLine: L} = require('common-tags')
// TODO: minimist is a simpler alternative to commander.js
const commander = require('commander')


function wrapCommander({
  maintainDependencies,
  lint,
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
  commander
    .command('deps')
    .description('run semi-automated dependency maintenance operations')
    .action(() => maintainDependencies())

  commander
    .command('lint')
    .description('lint the source code')
    .action(() => lint())

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

  commander
    .command('todo')
    .description('generate a todo-report for this very program')
    .action(() => todo())

  commander
    .command('docs')
    .description('build the documentation')
    .action(() => docs())

  commander
    .command('pkg-setup')
    .description('set up the PKGBUILD file')
    .action(() => setupPkg())

  commander
    .command('pkg-make')
    .description('make the PKGBUILD file')
    .action(() => makePkg())

  commander
    .command('pkg-install')
    .description('install the Pacman tarball')
    .option('--pkgrel <NUMBER>', "set the 'pkgrel' number", 1)
    .action(({pkgrel}) => installPkg({pkgrel}))

  commander
    .command('pub-npm')
    .description('publish the package to the NPM repository')
    .action(() => publishToNpm())

  commander
    .command('pub-aur')
    .description('publish the package to the AUR repository')
    .action(() => publishToAur())

  commander
    .command('release')
    .description('build and release the application')
    .action(() => release())

  return commander
}


module.exports = {
  wrapCommander,
}
