const { safeDump } = require('js-yaml');

const createGossObject = wallet => ({
  file: {
    [`/usr/local/bin/${wallet.baseBinary}d`]: {
      exists: true,
      mode: '0755',
      filetype: 'file',
    },
    [`/usr/local/bin/${wallet.baseBinary}-cli`]: {
      exists: true,
      mode: '0755',
      filetype: 'file',
    },
    [`/usr/local/bin/${wallet.baseBinary}-tx`]: { exists: true, mode: '0755', filetype: 'file' },
    [`/home/${wallet.baseBinary}/${wallet.basedir}${wallet.configFile}`]: {
      exists: true,
      filetype: 'file',
      contains: ['rpcuser', 'rpcpassword'],
    },
    [`/home/${wallet.baseBinary}/${wallet.basedir}masternode.conf`]: {
      exists: true,
      filetype: 'file',
      contains: ['Masternode config file'],
    },
    [`/home/${wallet.baseBinary}/data`]: { filetype: 'directory', exists: true },
  },
  port: {
    [`tcp:${wallet.mainnetPort}`]: { listening: true },
    [`tcp:${wallet.mainRpcPort}`]: { listening: true },
  },
  user: { [wallet.baseBinary]: { exists: true, groups: [wallet.baseBinary], home: `/home/${wallet.baseBinary}` } },
  group: { [wallet.baseBinary]: { exists: true } },
  process: { [`${wallet.baseBinary}d`]: { running: true } },
});

const dumpGossDocument = wallet => safeDump(createGossObject(wallet));

module.exports = {
  createGossObject,
  dumpGossDocument,
};
