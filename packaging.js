/**
 * This file is part of tasks
 * Copyright (C) 2019-present Dario Giovannetti <dev@dariogiovannetti.net>
 * Licensed under MIT
 * https://github.com/kynikos/lib.js.tasks/blob/master/LICENSE
 */

const fs = require('fs')


function makeComments(prefix, lines) {
  return lines.reduce((acc, line) => {
    if (line != null) {
      return acc.concat(`# ${prefix}${line}`)
    }
    return acc
  }, [])
}


function makeVar(name, value, quotes = '') {
  if (value != null) {
    return `${name}=${quotes}${value}${quotes}`
  }
  return null
}


function makeArray(name, array, quotes = '') {
  if (array != null && array.length) {
    let code

    if (array.length > 1) {
      code = `\n${array.map((value) => {
        return `  ${quotes}${value}${quotes}`
      }).join('\n')}\n`
    } else {
      code = `${quotes}${array[0]}${quotes}`
    }

    return `${name}=(${code})`
  }
  return null
}


function makeVarOrArray(name, value, quotes = '') {
  if (Array.isArray(value)) return makeArray(name, value, quotes)
  return makeVar(name, value, quotes)
}


function makeFunction(name, block) {
  if (block != null) {
    return `${name}() {\n${block.split('\n').map((line) => {
      if (line) return `  ${line}`
      return line
    }).join('\n')}\n}`
  }
  return null
}


function writePkgbuild(
  outputPath,
  {
    Maintainers = [],
    Contributors = [],
    pkgbase,
    pkgname,
    pkgver,
    pkgrel,
    epoch,
    pkgdesc,
    arch,
    url,
    license,
    groups,
    depends,
    optdepends,
    makedepends,
    checkdepends,
    provides,
    conflicts,
    replaces,
    backup,
    options,
    install,
    changelog,
    source,
    noextract,
    validpgpkeys,
    md5sums,
    sha1sums,
    sha224sums,
    sha256sums,
    sha384sums,
    sha512sums,
    b2sums,
    prepare,
    // 'pkgver' is also a regular variable
    pkgverFn,
    build,
    check,
    // 'package' is a reserved keyword
    package: packageFn,
  },
) {
  const contentLines = [
    ...makeComments('Maintainer: ', Maintainers),
    ...makeComments('Contributor: ', Contributors),
    (Maintainers || Contributors) ? '' : null,
    makeVar('pkgbase', pkgbase),
    makeVarOrArray('pkgname', pkgname),
    makeVar('pkgver', pkgver),
    makeVar('pkgrel', pkgrel),
    makeVar('epoch', epoch),
    makeVar('pkgdesc', pkgdesc, '"'),
    makeArray('arch', arch, "'"),
    makeVar('url', url, '"'),
    makeArray('license', license, "'"),
    makeArray('groups', groups),
    makeArray('depends', depends, "'"),
    makeArray('optdepends', optdepends, "'"),
    makeArray('makedepends', makedepends, "'"),
    makeArray('checkdepends', checkdepends, "'"),
    makeArray('provides', provides, "'"),
    makeArray('conflicts', conflicts, "'"),
    makeArray('replaces', replaces, "'"),
    makeArray('backup', backup, "'"),
    makeArray('options', options, "'"),
    makeVar('install', install, '"'),
    makeVar('changelog', changelog, '"'),
    makeArray('source', source, '"'),
    makeArray('noextract', noextract, '"'),
    makeArray('validpgpkeys', validpgpkeys, "'"),
    makeArray('md5sums', md5sums, "'"),
    makeArray('sha1sums', sha1sums, "'"),
    makeArray('sha224sums', sha224sums, "'"),
    makeArray('sha256sums', sha256sums, "'"),
    makeArray('sha384sums', sha384sums, "'"),
    makeArray('sha512sums', sha512sums, "'"),
    makeArray('b2sums', b2sums, "'"),
    prepare ? '' : null,
    makeFunction('prepare', prepare),
    pkgverFn ? '' : null,
    makeFunction('pkgver', pkgverFn),
    build ? '' : null,
    makeFunction('build', build),
    check ? '' : null,
    makeFunction('check', check),
    packageFn ? '' : null,
    makeFunction('package', packageFn),
    '',
  ]

  const content = contentLines.filter((line) => line != null).join('\n')

  if (outputPath) {
    // eslint-disable-next-line no-sync
    fs.writeFileSync(outputPath, content)
  }

  return content
}


function writePkgbuildNodeJs(
  outputPath,
  {
    Maintainers,
    Contributors,
    pkgbase,
    pkgname,
    pkgver,
    pkgrel,
    epoch,
    pkgdesc,
    // arch,
    archExtra = [],
    url,
    license,
    groups,
    // depends,
    dependsExtra = [],
    optdepends,
    // makedepends,
    makedependsExtra = [],
    checkdepends,
    provides,
    conflicts,
    replaces,
    backup,
    options,
    install,
    changelog,
    source,
    noextract,
    validpgpkeys,
    md5sums,
    sha1sums,
    sha224sums,
    sha256sums,
    sha384sums,
    sha512sums,
    b2sums,
    prepare,
    // 'pkgver' is also a regular variable
    pkgverFn,
    build,
    check,
    // 'package' is a reserved keyword
    // package: packageFn,
    packagePre,
    packagePost,
  },
) {
  return writePkgbuild(
    outputPath,
    {
      Maintainers,
      Contributors,
      pkgbase,
      pkgname,
      pkgver,
      pkgrel,
      epoch,
      pkgdesc,
      arch: ['any', ...archExtra],
      url,
      license,
      groups,
      depends: ['nodejs', ...dependsExtra],
      optdepends,
      makedepends: ['npm', ...makedependsExtra],
      checkdepends,
      provides,
      conflicts,
      replaces,
      backup,
      options,
      install,
      changelog,
      source,
      noextract,
      validpgpkeys,
      md5sums,
      sha1sums,
      sha224sums,
      sha256sums,
      sha384sums,
      sha512sums,
      b2sums,
      prepare,
      pkgverFn,
      build,
      check,
      // TODO: Periodically check whether the upstream bugs are fixed
      //   Also update https://wiki.archlinux.org/index.php/Node.js_package_guidelines
      // TODO: Is https://bugs.archlinux.org/task/63396 fixed?
      //   Also update https://wiki.archlinux.org/index.php/Node.js_package_guidelines
      package: [
        packagePre,
        `\
npm install -g --user root --prefix "\${pkgdir}/usr" "\${srcdir}/\${pkgname}-\${pkgver}.tgz" --cache "\${srcdir}/npm-cache"

# Non-deterministic race in npm gives 777 permissions to random directories.
# See https://github.com/npm/npm/issues/9359 for details.
find "\${pkgdir}/usr" -type d -exec chmod 755 {} +

# npm gives ownership of ALL FILES to build user
# https://bugs.archlinux.org/task/63396
chown -R root:root "$pkgdir"\
        `,
        packagePost,
      ].filter((block) => block != null).join('\n'),
    },
  )
}


module.exports = {
  writePkgbuild,
  writePkgbuildNodeJs,
}
