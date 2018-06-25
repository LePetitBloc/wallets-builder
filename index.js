const { resolve } = require('path');
const { existsSync } = require('fs');
const walletsMap = require('wallets.json');
const { Observable } = require('rxjs/Observable');
require('rxjs/add/observable/from');
require('rxjs/add/operator/merge');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/operator/map');
require('rxjs/add/operator/concat');
require('rxjs/add/operator/filter');
const { spawn } = require('observable-child-process');
const { mkdir, writeFile } = require('@lutangar/observable-fs');
const createGit = require('observable-git');
const { createRepositoryURL, createOrganizationRepository } = require('observable-git/github');
const { createArgsMap, dockerBuild } = require('./docker');
const { makeWalletDir, initLocalRepository } = require('./repository');
const createWALLETS = require('./createWALLETS.md');
require('isomorphic-fetch');

const BLACKLIST = [];
const WALLETS_DIR = './wallets/';
const organization = 'LePetitBloc';
const createRemoteRepository = createOrganizationRepository(organization);
const availableWallets = Object.keys(walletsMap)
  .map(name => ({
    ...walletsMap[name],
    name,
  }))
  .map(wallet => ({
    ...wallet,
    canonicalName: wallet.baseBinary.toLowerCase(),
    latest: `${organization.toLowerCase()}/${wallet.baseBinary.toLowerCase()}d:latest`,
    organization,
  }))
  .map((wallet, i, wallets) => ({
    ...wallet,
    image: wallet.tag ? `${organization.toLowerCase()}/${wallet.canonicalName}d:${wallet.tag}` : wallet.latest,
    Dockerfile: `${WALLETS_DIR}${wallet.canonicalName}/Dockerfile`,
    directory: `${resolve(`${WALLETS_DIR}${wallet.canonicalName}`)}/`,
    rpcpassword: Math.random()
      .toString(36)
      .substr(2, 8),
    args: createArgsMap(wallet),
    remote: createRepositoryURL(organization, `${wallet.canonicalName}d`),
    parentIndex: wallets.findIndex(w => w.name === wallet.parent),
  }))
  .map(wallet => ({
    ...wallet,
    localRepository: `${resolve(`${wallet.directory}/repository`)}/`,
  }))
  .map((wallet, i, wallets) => ({
    ...wallet,
    parent: wallet.parentIndex !== -1 ? wallets[wallet.parentIndex] : null,
  }))
  .map(wallet => ({
    ...wallet,
    reference: existsSync(wallet.Dockerfile) ? wallet : wallet.parent,
  }))
  .filter(
    wallet =>
      (existsSync(wallet.Dockerfile) || (wallet.parent && existsSync(wallet.parent.Dockerfile))) &&
      !BLACKLIST.includes(wallet.canonicalName)
  );

writeFile('WALLETS.md', createWALLETS({ wallets: availableWallets, organization })).subscribe();

Observable.from(availableWallets)
  .mergeMap(
    wallet => {
      const git = createGit(wallet.localRepository);

      return mkdir(wallet.directory)
        .filter(wallet.masternode)
        .concat(
          makeWalletDir(wallet).merge(
            createRemoteRepository({
              name: `${wallet.canonicalName}d`,
              description: `${wallet.name} daemon container for headless wallet${
                wallet.masternode ? ' and masternode' : ''
              }.`,
              homepage: `https://github.com/${organization}/wallets-builder`,
              has_issues: false,
              has_projects: false,
              has_wiki: false,
              auto_init: false,
            })
          )
        )
        .concat(initLocalRepository(git)(wallet))
        .concat(
          dockerBuild(wallet.args, [wallet.image, wallet.latest], wallet.localRepository).concat(
            spawn('dgoss', ['run', wallet.image], { env: { ...process.env, GOSS_FILES_PATH: wallet.localRepository } })
          )
        )
        .concat(spawn('docker', ['push', wallet.image]).merge(spawn('docker', ['push', wallet.latest])))
        .concat(
          createRemoteRepository({
            name: `${wallet.canonicalName}d`,
            description: `${wallet.name} daemon container for headless wallet${
              wallet.masternode ? ' and masternode' : ''
            }.`,
            homepage: `https://github.com/${organization}/wallets-builder`,
            has_issues: false,
            has_projects: false,
            has_wiki: false,
            auto_init: false,
          })
        )
        .concat(git('push', '--tags', '-f', 'origin', 'HEAD'));
    },
    () => {},
    2
  )
  .subscribe();
