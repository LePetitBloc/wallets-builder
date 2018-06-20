const createArgsMap = wallet => ({
  WALLET: wallet.baseBinary,
  BASE_DIR: wallet.basedir,
  CONFIG_FILE: wallet.configFile,
  PORT: wallet.mainnetPort,
  RPC_PORT: wallet.mainRpcPort,
  REPOSITORY: `${wallet.repository}.git`,
  REF: wallet.tag ? `tags/${wallet.tag}` : wallet.branch ? `remotes/origin/${wallet.branch}` : 'master',
});

const createDockerArgs = argsMap =>
  Object.keys(argsMap).reduce((args, key) => args.concat('--build-arg').concat(`${key}=${argsMap[key]}`), []);

module.exports = {
  createArgsMap,
  createDockerArgs,
};
