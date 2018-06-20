const template = ({
  name,
  binary,
  emoji = '',
  importantEmoji = ':bangbang:',
  warningEmoji = ':warning:',
  baseBinary,
  image,
  rpcpassword,
  basedir,
  configFile,
  repository,
  announcement,
  explorers = [],
  requiredTokens,
  symbol,
  mainnetPort,
  mainRpcPort,
  nodes = [],
  website,
  bdbVersion,
  organization,
  masternode,
}) =>
  `# ${name} core Wallet Daemon (\`${baseBinary}d\`)
${name} core Wallet Daemon for headless wallets${masternode ? ' and **masternodes**' : ''}. ${emoji}

> For a list of all available wallet images see https://${organization.toLowerCase()}.github.io/wallets/

## Issues
- Parameters value issues should be reported at:
https://github.com/${organization.toLowerCase()}/wallets

- All other issues should be reported at:
https://github.com/${organization.toLowerCase()}/wallets-builder

## Usage
${masternode &&
    'The container can either be used as a classic headless wallet or a **masternode**, only the *command* arguments will differ.'}

### Headless wallet
1. Run a **wallet** container and specify at least the \`rpcuser\` and \`rpcpassword\` to interact with the **${name}** daemon:
\`\`\`
docker run --name ${baseBinary}-wallet --restart always -d ${image} -rpcuser=${baseBinary.toLowerCase()}-wallet -rpcpassword=${rpcpassword}
\`\`\`
> We recommend to mount a volume for easier access to the *data* and the *configuration* files.
> You should also create a configuration for your RPC credentials (see \`wallet/${basedir}${configFile}\`) to avoid retyping them when using the internal \`${baseBinary}-cli\`.
> \`\`\`
> docker run --name ${baseBinary}-wallet --restart always -d -v ./wallet/:/home/${baseBinary.toLowerCase()}/ ${image}
> \`\`\`

> ${warningEmoji} Ensure that a \`data\` directory **exists** and is **writable** in the mounted host directory.

2. Once your wallet is running, you can print your main address:
\`\`\`
docker exec ${baseBinary.toLowerCase()}-wallet ${baseBinary}-cli getaccountaddress ""
\`\`\`
> GK92mbjS9bCAUuU7DEyyuK9US1qLqkoyce

2. **Encrypt your wallet:**
> You can use \`pwgen\` first to generate your *passphrase*:
> \`\`\`
> pwgen 32 1
> \`\`\`
> quohd4kaw9guvi8ie7phaighawaiLoo6
\`\`\`
docker exec ${baseBinary.toLowerCase()}-wallet ${baseBinary}-cli encryptwallet quohd4kaw9guvi8ie7phaighawaiLoo6
\`\`\`
> Wallet encrypted; ${name} Core server stopping, restart to run with encrypted wallet. The keypool has been flushed, you need to make a new backup.

${importantEmoji} Don't forget to **backup** your *passphrase*.

${masternode &&
    `### Masternode

#### Prerequisites
1. You must have received *${requiredTokens} ${symbol}* on your **wallet** in a **single transaction**, and **must** have waited for, at least, **1 confirmation**.
> **Note1:** If the *${requiredTokens} ${symbol}* came from multiple transactions, you can send them back to yourself.

> **Note2:** Beware of the transaction cost, you should own *${requiredTokens + 1} ${symbol}* as a safety measure.

2. Only then you may find the corresponding transaction \`hash\` and \`index\` :
\`\`\`
docker exec ${baseBinary.toLowerCase()}-wallet ${baseBinary}-cli masternode outputs
\`\`\`
>\`\`\`
>{
>  "8e835a7d867d335434925c32f38902268e131e99a5821557d3e77f8ca3829fd8" : "0"
>}
>\`\`\`

3. Then generate a **masternode** private key:
\`\`\`
masternode genkey
\`\`\`
>\`\`\`
>7ev3RXQXYfztreEz8wmPKgJUpNiqkAkkdxt24C3ZKtg5qEVfou9
>\`\`\`

4. And finally creates the \`~/${basedir}/masternode.conf\` file, and fill in following this template:
> \`mn01 masternode:21529 YouMasterNodePrivateKey TransactionHash 0 YourWalletAddress:100\`
\`\`\`
touch ./${baseBinary}/conf/masternode.conf
\`\`\`

#### Setup
1. As a classic wallet, create a \`masternode/${basedir}${configFile}\` configuration file
\`\`\`
rpcuser=${baseBinary.toLowerCase()}-mn01
rpcpassword=${rpcpassword}
masternode=1
masternodeprivkey=7ev3RXQXYfztreEz8wmPKgJUpNiqkAkkdxt24C3ZKtg5qEVfou9
externalip=YOUR.EXTERNAL.IP:${mainnetPort}
${nodes.map(node => `addnode=${node}`).join('\r\n')}
\`\`\`

2. Run a container as a **masternode**:
\`\`\`
docker run --name ${baseBinary}-masternode --restart always -d -p ${mainnetPort}:${mainnetPort} -p ${mainRpcPort}:${mainRpcPort} -v /home/${baseBinary}/masternode:/home/${baseBinary}/ ${image} -masternode=1
\`\`\`

3. Check the the number of \`blocks\` until the chain is sync:
\`\`\`
docker exec ${baseBinary}-masternode ${baseBinary}-cli getinfo
\`\`\`

4. Once the chain synced you can start the **masternode** from your **wallet**:
\`\`\`
docker exec ${baseBinary.toLowerCase()}-wallet ${baseBinary}-cli ${baseBinary}-masternode start-all
\`\`\`
> You might need to unlock your **wallet** first:
> \`\`\`
>  docker exec ${baseBinary.toLowerCase()}-wallet ${baseBinary}-cli walletpassphrase quohd4kaw9guvi8ie7phaighawaiLoo6 60
> \`\`\`
> ${warningEmoji} Mind the **space** before the command above, that's not a typo, it’s meant to avoid storing your passphrase in *history*.

5. Then check the **masternode** status with your initial **transaction hash**:
\`\`\`
docker exec ${baseBinary.toLowerCase()}-wallet ${baseBinary}-cli masternodelist | grep 6d94f70499c3f7ba2c59acaa5c04e54ef123d0e460bb07c55ace6464deaf3c85
\`\`\`
> \`"6d94f70499c3f7ba2c59acaa5c04e54ef123d0e460bb07c55ace6464deaf3c85-1": "ENABLED",\`

## docker-compose
You could setup **both** at the same time using \`docker-compose\`.
Check the provided \`docker-compose.yml\` as an example and tweak it to your needs!
\`\`\`
docker-compose up --build
\`\`\`
`}

## Resources
${website && `- Website ${website}`}
- Github ${repository}
${announcement && `- Bitcointalk announcement ${announcement}`}
${(explorers.length > 0) ? `- Block explorer ${explorers.join()}` : ''}

## Parent project
- https://github.com/${organization.toLowerCase()}/wallets
- https://github.com/${organization.toLowerCase()}/wallets-builder

## Parent image
- Berkeley DB v${bdbVersion}
\`FROM ${organization.toLowerCase()}/bdb:${bdbVersion}\`
> https://github.com/${organization.toLowerCase()}/bdb/tree/${bdbVersion}
> https://hub.docker.com/r/${organization.toLowerCase()}/bdb/

## Licence
MIT
`;

module.exports = template;
