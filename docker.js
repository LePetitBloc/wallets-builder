const { spawn } = require('observable-child-process');
const isNumber = require('lodash.isnumber');

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

const replaceArgs = (substr, args = {}) =>
  Object.keys(args).reduce(
    (newSubStr, key) =>
      newSubStr.replace(
        new RegExp(`(ARG ${key}=).*`, 'g'),
        isNumber(args[key]) ? `$1${args[key]}` : `$1"${args[key]}"`
      ),
    substr
  );

const dockerBuild = (args = {}, tags = [], cwd) =>
  spawn(
    'docker',
    [
      'build',
      ...Object.keys(args).reduce(
        (argsArray, key) => argsArray.concat('--build-arg').concat(`${key}=${args[key]}`),
        []
      ),
      ...tags.reduce((tagsArgs, tag) => tagsArgs.concat('-t').concat(tag), []),
      '.',
    ],
    { cwd }
  );

module.exports = {
  createArgsMap,
  createDockerArgs,
  replaceArgs,
  dockerBuild,
};
