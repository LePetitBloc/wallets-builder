const createWalletObject = ({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword }) => ({
  restart: 'always',
  ports: [`${mainnetPort}:${mainnetPort}`, `${mainRpcPort}:${mainRpcPort}`],
  command: [`-rpcuser=${baseBinary.toLowerCase()}-wallet`, `-rpcpassword=${rpcpassword}`, '-server=1', '-listen=0'],
  volumes: [`./wallet/:/home/${baseBinary.toLowerCase()}/`],
});

const createMasternodeObject = ({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword, nodes }) => ({
  restart: 'always',
  ports: [`${mainnetPort}:${mainnetPort}`, `${mainRpcPort}:${mainRpcPort}`],
  command: [
    `-rpcuser=${baseBinary.toLowerCase()}-mn01`,
    `-rpcpassword=${rpcpassword}`,
    '-rpcallowip=::/0',
    '-server=0',
    '-listen=1',
    '-masternode=1',
    '-masternodeprivkey=YourMasternodePrivKey',
  ].concat(nodes.map(node => `-addnode=${node}`)),
  volumes: [`./masternode/:/home/${baseBinary.toLowerCase()}/`],
});

const createObject = ({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword, nodes }) => ({
  version: '3',
  services: {
    wallet: {
      image,
      ...createWalletObject({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword }),
    },
    masternode: {
      image,
      ...createMasternodeObject({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword, nodes }),
    },
  },
});

const createBuildObject = ({ baseBinary, repository }) => ({
  build: {
    context: '.',
    args: {
      REPOSITORY: repository,
      REF: 'master',
    },
  },
});

const createDevObject = ({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword, nodes, repository }) => ({
  version: '3',
  services: {
    wallet: {
      build: createBuildObject({ baseBinary, repository }),
      ...createWalletObject({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword }),
    },
    masternode: {
      build: createBuildObject({ baseBinary, repository }),
      ...createMasternodeObject({ image, mainnetPort, mainRpcPort, baseBinary, rpcpassword, nodes }),
    },
  },
});

module.exports = {
  createObject,
  createDevObject,
};
