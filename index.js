const walletsMap = require('wallets.json');
const { dirname, resolve } = require('path');
const { existsSync } = require('fs');
const { Observable } = require('rxjs/Observable');
const { spawn } = require('observable-child-process');
const { mkdir, writeFile, readFile } = require('@lutangar/observable-fs');
const createGit = require('observable-git');
require('rxjs/add/observable/from');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/operator/map');
require('rxjs/add/operator/concat');
require('rxjs/add/operator/filter');
const { createRepositoryURL, createOrganizationRepository } = require('observable-git/github');
const { safeDump } = require('js-yaml');
const isNumber = require('lodash.isnumber');
const { createArgsMap, createDockerArgs } = require('./args');
const { createGossObject } = require('./repository/goss');
const { createObject, createDevObject } = require('./repository/docker-compose');
const createLICENCE = require('./repository/LICENCE.md');
const createREADME = require('./repository/README.md');
const createFAQ = require('./repository/FAQ.md');
const createConfigFile = require('./repository/configfile.conf');
const createMasternodeFile = require('./repository/masternode.conf');
require('isomorphic-fetch');

const BLACKLIST = ['xuv'];
const WALLETS_DIR = './wallets/';
const organization = 'LePetitBloc';
const availableWallets = Object.keys(walletsMap)
  .map(name => ({
    name,
    ...walletsMap[name],
    latest: `${organization.toLowerCase()}/${walletsMap[name].baseBinary.toLowerCase()}d:latest`,
    image: walletsMap[name].tag
      ? `${organization.toLowerCase()}/${walletsMap[name].baseBinary.toLowerCase()}d:${walletsMap[name].tag}`
      : `${organization.toLowerCase()}/${walletsMap[name].baseBinary.toLowerCase()}d:latest`,
    canonicalName: walletsMap[name].baseBinary.toLowerCase(),
    Dockerfile: `${WALLETS_DIR}${walletsMap[name].baseBinary.toLowerCase()}/Dockerfile`,
  }))
  .map((wallet, i, wallets) => ({
    ...wallet,
    parentIndex: wallets.findIndex(w => w.name === wallet.parent),
  }))
  .map((wallet, i, wallets) => ({
    ...wallet,
    parent: wallet.parentIndex !== -1 ? wallets[wallet.parentIndex] : null,
  }))
  .filter(
    wallet =>
      (existsSync(wallet.Dockerfile) || (wallet.parent && existsSync(wallet.parent.Dockerfile))) &&
      !BLACKLIST.includes(wallet.canonicalName)
  );

writeFile(
  'WALLETS.md',
  `# Available core wallets Docker images
${availableWallets
    .map(
      wallet =>
        `${wallet.name}
- DockerHub [${wallet.latest}](https://hub.docker.com/r/${organization.toLowerCase()}/${wallet.canonicalName}d/)
- Github https://github.com/${organization}/${wallet.canonicalName}d
`
    )
    .join('\r\n')}`
).subscribe();

const createConfTemplateDir = wallet => ({ directory, rpcpassword, rpcuser }) => {
  return mkdir(`${directory}`)
    .concat(mkdir(`${directory}data/`))
    .concat(mkdir(`${directory}${wallet.basedir}`))
    .concat(writeFile(`${directory}.gitignore`, 'data/*'))
    .concat(writeFile(`${directory}data/.gitkeep`))
    .concat(
      writeFile(
        `${directory}${wallet.basedir}${wallet.configFile}`,
        createConfigFile({ ...wallet, rpcpassword, rpcuser })
      )
    )
    .concat(writeFile(`${directory}${wallet.basedir}masternode.conf`, createMasternodeFile(wallet)));
};

Observable.from(availableWallets)
  .mergeMap(
    wallet => {
      const Dockerfile = existsSync(wallet.Dockerfile) ? wallet.Dockerfile : wallet.parent.Dockerfile;
      const walletDirectory = `${resolve(`${WALLETS_DIR}${wallet.canonicalName}`)}/`;
      const repositoryDirectory = `${resolve(`${WALLETS_DIR}${wallet.canonicalName}/repository`)}/`;
      const repositoryURL = createRepositoryURL(organization.toLowerCase(), `${wallet.canonicalName}d`);
      const createRepository = createOrganizationRepository(organization.toLowerCase());
      const git = createGit(repositoryDirectory);
      const gossObject = createGossObject(wallet);
      const createConfDir = createConfTemplateDir(wallet);
      const rpcpassword = Math.random()
        .toString(36)
        .substr(2, 8);
      const argsMap = createArgsMap(wallet);

      return spawn('docker', [
        'build',
        ...createDockerArgs(argsMap),
        '-t',
        wallet.image,
        '-f',
        Dockerfile,
        dirname(Dockerfile),
      ])
        .concat(mkdir(walletDirectory))
        .concat(spawn('dgoss', ['run', wallet.image], { env: { ...process.env, GOSS_FILES_PATH: walletDirectory } }))
        .filter(wallet.masternode)
        .concat(
          spawn('rm', ['-rf', 'repository'], { cwd: walletDirectory })
            .concat(mkdir(repositoryDirectory))
            .concat(
              readFile(Dockerfile).flatMap(DockerfileContent =>
                writeFile(
                  `${repositoryDirectory}/Dockerfile`,
                  Object.keys(argsMap).reduce(
                    (content, key) =>
                      content.replace(
                        new RegExp(`(ARG ${key}=).*`, 'g'),
                        isNumber(argsMap[key]) ? `$1${argsMap[key]}` : `$1"${argsMap[key]}"`
                      ),
                    DockerfileContent.toString('utf8')
                  )
                )
              )
            )
            .concat(
              writeFile(
                `${repositoryDirectory}/LICENCE.md`,
                createLICENCE({ year: new Date().getFullYear(), organization })
              )
            )
            .concat(
              writeFile(`${repositoryDirectory}/README.md`, createREADME({ ...wallet, rpcpassword, organization }))
            )
            .concat(writeFile(`${repositoryDirectory}/FAQ.md`, createFAQ({ ...wallet, rpcpassword })))
            .concat(
              writeFile(`${repositoryDirectory}/docker-compose.yml`, safeDump(createObject({ ...wallet, rpcpassword })))
            )
            .concat(
              writeFile(
                `${repositoryDirectory}/docker-compose.dev.yml`,
                safeDump(createDevObject({ ...wallet, rpcpassword }))
              )
            )
            .concat(writeFile(`${repositoryDirectory}/goss.yaml`, safeDump(gossObject)))
            .concat(writeFile(`${repositoryDirectory}/goss.yaml`, safeDump(gossObject)))
            .concat(
              createConfDir({
                directory: `${repositoryDirectory}/wallet/`,
                rpcpassword,
                rpcuser: `${wallet.baseBinary.toLowerCase()}-wallet`,
              })
            )
            .concat(
              createConfDir({
                directory: `${repositoryDirectory}/masternode/`,
                rpcpassword,
                rpcuser: `${wallet.baseBinary.toLowerCase()}-mn01`,
              })
            )
            .concat(
              createRepository({
                name: `${wallet.canonicalName}d`,
                description: `${wallet.name} daemon container for headless wallet${
                  wallet.masternode ? ' and masternode' : ''
                }.`,
                homepage: `https://github.com/LePetitBloc/wallets-builder`,
                has_issues: false,
                has_projects: false,
                has_wiki: false,
                auto_init: false,
              })
            )
            .concat(git('init'))
            .concat(git('config', '--local', 'user.name', 'LePetitBot'))
            .concat(git('config', '--local', 'user.email', 'bonjour@lepetitbloc.net'))
            .concat(git('add', '-A'))
            .concat(git('commit', '--allow-empty', '-m', `update image to ${wallet.tag || 'latest'}`))
            .concat(git('remote', 'add', 'origin', repositoryURL))
            .concat(git('push', '-f', 'origin', 'HEAD'))
        )
        .concat(spawn('docker', ['push', wallet.image]));
    },
    () => {},
    1
  )
  .subscribe();
