const wallets = require('wallets.json');
const chalk = require('chalk');
const spawnPromise = require('./spawnPromise');
const buildArgs = require('./buildArgs');

const blacklist = ['PIVX'];

Object
    .keys(wallets)
    .map((name) => ({
        name,
        image: `lepetitbloc/${wallets[name].baseBinary.toLowerCase()}d:latest`,
        ...wallets[name],
    }))
    .filter((wallet) => (wallet.name === 'Dash' || wallet.parent === 'Dash') && wallet.masternode && !blacklist.includes(wallet.name))
    .forEach(async (wallet) => {
        const image = `lepetitbloc/${wallet.baseBinary.toLowerCase()}d:latest`;

        await spawnPromise('docker', ['build', ...buildArgs(wallet), '-t', image, './dash'])
            .then(() => console.log(chalk`{green Successfully built and tagged {bold ${image}}}`))
            .then(() => spawnPromise('docker', ['push', image])
                .then(() => console.log(chalk`{green Successfully pushed {bold ${image}} to DockerHub}`))
                .catch(() => console.error(chalk`{red {bold ${image}} push failed`))
            )
            .catch(() => console.error(chalk`{red {bold ${image}} build failed`))
        ;
    })
;
