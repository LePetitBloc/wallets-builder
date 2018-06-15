const buildArgs = (wallet) => {
    const argsMap = {
        WALLET: wallet.baseBinary,
        BASE_DIR: wallet.basedir,
        CONFIG_FILE: wallet.configFile,
        PORT: wallet.mainnetPort,
        RPC_PORT: wallet.mainRpcPort,
        REPOSITORY: `${wallet.repository}.git`,
        REF: wallet.tag ? `tags/${wallet.tag}` : wallet.branch ? `remotes/origin/${wallet.branch}` : 'master',
    };

    return Object
        .keys(argsMap)
        .reduce((args, key) => args.concat('--build-arg').concat(`${key}=${argsMap[key]}`), [])
    ;
};

module.exports = buildArgs;
