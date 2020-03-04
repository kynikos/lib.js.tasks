/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

const readlineSync = require('readline-sync')
const Listr = require('listr')
const {oneLine: L} = require('common-tags')


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
          title: 'Release dependencies',
          fn: releaseDependencies,
          alt: 'Did you release all the dependencies?',
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


module.exports = {
  releaseProcedure,
}
