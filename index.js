const walletsMap = require('wallets.json');
const { dirname, resolve } = require('path');
const { existsSync } = require('fs');
const { Observable } = require('rxjs/Observable');
require('rxjs/add/observable/from');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/operator/concat');
const { mkdir, writeFile } = require('./fs');
const { spawn } = require('observable-child-process');
const { dumpGossDocument } = require('./goss');
const buildArgs = require('./buildArgs');

const BLACKLIST = ['pivx'];
const WALLETS_DIR = './wallets/';
const availableWallets = Object
    .keys(walletsMap)
    .map((name) => ({
        name,
        ...walletsMap[name],
        image: `lepetitbloc/${walletsMap[name].baseBinary.toLowerCase()}d:latest`,
        canonicalName: walletsMap[name].baseBinary.toLowerCase(),
        Dockerfile: `${WALLETS_DIR}${walletsMap[name].baseBinary.toLowerCase()}/Dockerfile`,
    }))
    .map((wallet, i, wallets) => ({
        ...wallet,
        parentIndex: wallets.findIndex((w) => w.name === wallet.parent)
    }))
    .map((wallet, i, wallets) => ({
        ...wallet,
        parent: wallet.parentIndex !== -1 ? wallets[wallet.parentIndex] : null,
    }))
    .filter((wallet) =>
        (existsSync(wallet.Dockerfile) || (wallet.parent && existsSync(wallet.parent.Dockerfile)))
        &&  !BLACKLIST.includes(wallet.canonicalName)
    )
;

writeFile(`WALLETS.md`, '# Available core wallets Docker images\r\n'+availableWallets
    .map((wallet) => `* ${wallet.name} [${wallet.image}](https://hub.docker.com/r/lepetitbloc/${wallet.canonicalName}d/)`)
    .join('\r\n')
).subscribe();

Observable
    .from(availableWallets)
    .mergeMap((wallet) => {
        const Dockerfile = existsSync(wallet.Dockerfile) ? wallet.Dockerfile : wallet.parent.Dockerfile;
        const walletDirectory = resolve(`${WALLETS_DIR}${wallet.canonicalName}`);

        return spawn('docker', [
            'build',
            ...buildArgs(wallet),
            '-t',
            wallet.image,
            '-f',
            Dockerfile,
            dirname(Dockerfile),
        ])
        .concat(mkdir(walletDirectory))
        .concat(writeFile(`${walletDirectory}/goss.yaml`, dumpGossDocument(wallet)))
        .concat(spawn('dgoss', ['run', wallet.image], { env: { ...process.env, GOSS_FILES_PATH: walletDirectory } }))
        .concat(spawn('docker', ['push', wallet.image]));
    }, () => {}, 1)
    .subscribe()
;
