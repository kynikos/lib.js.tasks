/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

const fs = require('fs')
const path = require('path')
const readlineSync = require('readline-sync')
const Listr = require('listr')
const {oneLine: L} = require('common-tags')
const {runSync, gitSync, gitInteractive, npmInteractive} =
  require('./subprocess')


function makeListrTasks(tasksConf) {
  return new Listr(tasksConf.map(({title, fn, alt, subTasksConf}) => {
    const task = {
      title,
      enabled: () => fn !== false,
    }

    if (typeof fn === 'function') {
      task.skip = () => {
        return !readlineSync.keyInYNStrict(`${title}?`)
      }
    }

    if (subTasksConf) {
      task.task = () => {
        return makeListrTasks(subTasksConf)
      }
    } else if (typeof fn === 'function') {
      task.task = fn
    } else {
      task.task = () => {
        if (readlineSync.keyInYNStrict(fn || alt)) {
          return true
        }
        throw new Error()
      }
    }

    return task
  }))
}


function releaseProcedure({
  updateMetafiles,
  checkNodeJsWebpackConfiguration,
  releaseDependencies,
  checkoutProductionBranch,
  updateVersion,
  updateDependencies,
  recompileApplication,
  runTests,
  checkRelatedFunctionality,
  lintCode,
  updateTodo,
  updateDatabaseDiagram,
  updateChangelog,
  updateDocumentation,
  buildDocumentation,
  setupDistributionPackages,
  testBuildDistributionPackages,
  testInstallDistributionPackages,
  testInstalledDistributionPackages,
  commitReleaseChanges,
  deployApplication,
  deployOtherServices,
  publishDocumentation,
  pushToRemoteGitRepository,
  publishToPackageIndex,
  publishToSoftwareDistributions,
  updateBugTracker,
  announceRelease,
  advertiseRelease,
  restoreDevelopmentEnvironment,
  ...unknownTask
}) {
  if (Object.keys(unknownTask).length) {
    throw new Error(`Unknown release tasks: ${Object.keys(unknownTask)}`)
  }

  const tasks = makeListrTasks([
    // TODO: Support custom checklist questions
    {
      title: 'Production build',
      subTasksConf: [
        {
          title: "Update project's metafiles",
          fn: updateMetafiles,
          alt: L`Did you check that all project's metafiles (package.json,
            requirements.txt, .gitignore, .npmignore etc.) are up to date?`,
        },
        {
          title: 'Check Node.js/Webpack configuration',
          fn: checkNodeJsWebpackConfiguration,
          alt: L`For Node.js/Webpack projects, are all dependencies actually
            listed as devDependencies in package.json? Webpack bundles them all
            together and 'npm install' would also unnecessarily install them
            under node_modules, increasing the package size; if relying on
            system-wide-installed libraries, use Webpack's 'externals' option.`,
        },
        {
          title: 'Release own dependencies',
          fn: releaseDependencies,
          alt: L`Did you release all the dependencies that you may have updated
            and linked to this project?`,
        },
        {
          title: 'Check out production branch',
          fn: checkoutProductionBranch,
          alt: L`Did you check out the correct branch in this repository and any
            linked ones?`,
        },
        {
          title: 'Update application version',
          fn: updateVersion,
          alt: "Did you update this application's version?",
        },
        {
          title: 'Update dependencies',
          fn: updateDependencies,
          alt: "Did you update this project's dependencies?",
        },
        {
          title: 'Recompile application',
          fn: recompileApplication,
          alt: 'Did you recompile the application?',
        },
      ],
    },
    {
      title: 'Testing',
      subTasksConf: [
        {
          title: 'Run automated tests',
          fn: runTests,
          alt: 'Did you run the automated tests?',
        },
        {
          title: 'Check related functionality',
          fn: checkRelatedFunctionality,
          alt: L`Did you check the compatibility of all related functionality,
            such as server backups?`,
        },
        {
          title: 'Lint code',
          fn: lintCode,
          alt: 'Did you lint the source code?',
        },
      ],
    },
    {
      title: 'Documentation',
      subTasksConf: [
        {
          title: 'Update TODO report',
          fn: updateTodo,
          alt: 'Did you update the TODO report?',
        },
        {
          title: 'Update database diagram',
          fn: updateDatabaseDiagram,
          alt: 'Did you update the database diagram?',
        },
        {
          title: 'Update changelog',
          fn: updateChangelog,
          alt: 'Did you update the changelog?',
        },
        {
          title: 'Update documentation sources',
          fn: updateDocumentation,
          alt: 'Did you update the documentation sources?',
        },
        {
          title: 'Build documentation',
          fn: buildDocumentation,
          alt: 'Did you build the documentation?',
        },
      ],
    },
    {
      title: 'Packaging',
      subTasksConf: [
        {
          title: 'Set up distribution packages',
          fn: setupDistributionPackages,
          alt: 'Did you set up the distribution packages?',
        },
        {
          title: 'Test building distribution packages',
          fn: testBuildDistributionPackages,
          alt: 'Did you test building the distribution packages?',
        },
        {
          title: 'Test installing distribution packages',
          fn: testInstallDistributionPackages,
          alt: 'Did you test installing the distribution packages?',
        },
        {
          title: 'Test the installed distribution packages',
          fn: testInstalledDistributionPackages,
          alt: 'Did you test the installed distribution packages?',
        },
      ],
    },
    {
      title: 'Deployment',
      subTasksConf: [
        {
          title: 'Merge, commit and tag',
          fn: commitReleaseChanges,
          alt: 'Did you merge, commit and tag the release changes?',
        },
        {
          title: 'Deploy main application',
          fn: deployApplication,
          alt: 'Did you deploy the application e.g. on the server?',
        },
        {
          title: 'Deploy other services',
          fn: deployOtherServices,
          alt: L`Did you deploy any other related services such as indexes or
            cron jobs?`,
        },
        {
          title: 'Publish documentation',
          fn: publishDocumentation,
          alt: 'Did you publish the documentation? (website, wiki...)',
        },
        {
          title: 'Push to remote git repository',
          fn: pushToRemoteGitRepository,
          alt: 'Did you push to the remote git repository?',
        },
        {
          title: 'Publish to package index',
          fn: publishToPackageIndex,
          alt: L`Did you publish the package to the language's index such as
            NPM or PyPi?`,
        },
        {
          title: 'Publish to software distributions',
          fn: publishToSoftwareDistributions,
          alt: L`Did you publish the package to software distribution
            repositories such as the Arch User Repository?`,
        },
        {
          title: 'Update bug tracker',
          fn: updateBugTracker,
          alt: L`Did you close the milestone on the bug tracker, updated labels,
            etc.?`,
        },
        {
          title: 'Announce the release',
          fn: announceRelease,
          alt: L`Did you announce the release such as on a mailing list or
            Twitter?`,
        },
        {
          title: 'Advertise the release',
          fn: advertiseRelease,
          alt: 'Did you advertise the release on platforms such as forums?',
        },
      ],
    },
    {
      title: 'Restore development environment',
      fn: restoreDevelopmentEnvironment,
      alt: L`Did you restore the development environment, such as checking out
        the appropriate git branch or updating the version number to an
        unstable one?`,
    },
  ])

  return tasks.run().catch((error) => {
    console.error(error)
  })
}


function npmPublish({tarball, public: public_}) {
  return npmInteractive([
    'publish',
    tarball,
    '--access',
    public_ ? 'public' : 'restricted',
  ])
}


function submitToAur({buildDir, pkgbase, pkgver}) {
  const aurRemote = `ssh://aur@aur.archlinux.org/${pkgbase}.git`
  const aurRemoteLabel = 'aur'

  // eslint-disable-next-line no-sync
  if (!fs.existsSync(path.join(buildDir, 'PKGBUILD'))) {
    // Enforce PKGBUILD to be named exactly like that: even though makepkg can
    // open any file with the -p option, it would be unexpected for the user
    throw new Error('PKGBUILD not found')
  }

  if (
    // eslint-disable-next-line no-sync
    !fs.existsSync(path.join(buildDir, '.git')) ||
    gitSync(['remote', '-v'], {cwd: buildDir}) !== aurRemote
  ) {
    if (!readlineSync.keyInYNStrict('Set up the AUR repository?')) {
      throw new Error('AUR repository not properly set up')
    }

    gitInteractive(['init'], {cwd: buildDir})
    gitInteractive(
      ['remote', 'add', aurRemoteLabel, aurRemote],
      {cwd: buildDir},
    )
    gitInteractive(['fetch', aurRemoteLabel], {cwd: buildDir})

    if (
      !readlineSync.keyInYNStrict(L`Check that the AUR repository was
        initialized correctly; do you want to continue submitting the package?`)
    ) {
      throw new Error('Properly set up the AUR repository')
    }
  }

  const srcInfo = runSync('makepkg', ['--printsrcinfo'], {cwd: buildDir})
  // eslint-disable-next-line no-sync
  fs.writeFileSync(path.join(buildDir, '.SRCINFO'), srcInfo)

  gitInteractive(
    ['add', 'PKGBUILD', '.SRCINFO'],
    {cwd: buildDir},
  )

  gitInteractive(
    ['commit', '-m', `Version ${pkgver}`],
    {cwd: buildDir},
  )

  if (
    !readlineSync.keyInYNStrict(L`Verify the correctness of the commit to the
      AUR repository; do you want to submit the package now?`)
  ) {
    throw new Error('Properly commit the changes to the AUR repository')
  }

  gitInteractive(['push'], {cwd: buildDir})
}


module.exports = {
  releaseProcedure,
  npmPublish,
  submitToAur,
}
