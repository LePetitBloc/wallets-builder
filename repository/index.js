require('rxjs/add/observable/from');
require('rxjs/add/operator/merge');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/operator/concat');
const { spawn } = require('observable-child-process');
const { mkdir, writeFile, readFile, copyFile } = require('@lutangar/observable-fs');
const { safeDump } = require('js-yaml');
const { replaceArgs } = require('../docker');
const { createGossObject } = require('./goss');
const { createObject, createDevObject } = require('./docker-compose');
const createLICENCE = require('./LICENCE.md');
const createREADME = require('./README.md');
const createConfigFile = require('./configfile.conf');
const createMasternodeFile = require('./masternode.conf');
const createFAQ = require('./FAQ.md');
require('isomorphic-fetch');

const createMakeWalletConfDir = (wallet = {}) => name =>
  mkdir(`${wallet.localRepository}${name}/`)
    .concat(
      mkdir(`${wallet.localRepository}${name}/data/`).merge(mkdir(`${wallet.localRepository}${name}/${wallet.basedir}`))
    )
    .concat(
      writeFile(`${wallet.localRepository}${name}/.gitignore`, 'data/*')
        .merge(writeFile(`${wallet.localRepository}${name}/data/.gitkeep`))
        .merge(
          writeFile(
            `${wallet.localRepository}${name}/${wallet.basedir}${wallet.configFile}`,
            createConfigFile({ ...wallet, rpcuser: `${wallet.baseBinary.toLowerCase()}-${name}` })
          )
        )
        .merge(
          writeFile(`${wallet.localRepository}${name}/${wallet.basedir}masternode.conf`, createMasternodeFile(wallet))
        )
    );

const writeWalletDockerfiles = (wallet = {}) =>
  readFile(wallet.reference.Dockerfile)
    .mergeMap(DockerfileContent =>
      writeFile(`${wallet.localRepository}/Dockerfile`, replaceArgs(DockerfileContent.toString('utf8'), wallet.args))
    )
    .merge(
      copyFile(`${wallet.reference.directory}/docker-entrypoint.sh`, `${wallet.localRepository}/docker-entrypoint.sh`)
    );

const makeWalletDir = (wallet = {}) => {
  const makeWalletConfDir = createMakeWalletConfDir(wallet, wallet.localRepository);

  return spawn('rm', ['-rf', wallet.localRepository])
    .concat(mkdir(wallet.localRepository))
    .concat(
      writeWalletDockerfiles(wallet)
        .merge(
          writeFile(
            `${wallet.localRepository}/LICENCE.md`,
            createLICENCE({ year: new Date().getFullYear(), ...wallet })
          )
        )
        .merge(writeFile(`${wallet.localRepository}/README.md`, createREADME(wallet)))
        .merge(writeFile(`${wallet.localRepository}/FAQ.md`, createFAQ(wallet)))
        .merge(writeFile(`${wallet.localRepository}/docker-compose.yml`, safeDump(createObject(wallet))))
        .merge(writeFile(`${wallet.localRepository}/docker-compose.dev.yml`, safeDump(createDevObject(wallet))))
        .merge(writeFile(`${wallet.localRepository}/goss.yaml`, safeDump(createGossObject(wallet))))
        .merge(makeWalletConfDir('wallet'))
        .merge(makeWalletConfDir('masternode'))
    );
};

const initLocalRepository = git => ({ remote, tag }) =>
  git('init')
    .concat(git('config', '--local', 'user.name', 'LePetitBot'))
    .concat(git('config', '--local', 'user.email', 'bonjour@lepetitbloc.net'))
    .concat(git('add', '-A'))
    .concat(git('commit', '--allow-empty', '-m', `update image to ${tag || 'latest'}`))
    .concat(git('tag', tag))
    .concat(git('remote', 'add', 'origin', remote));

module.exports = {
  createMakeWalletConfDir,
  writeWalletDockerfiles,
  makeWalletDir,
  initLocalRepository,
};
