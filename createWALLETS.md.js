const template = ({ wallets = [], organization }) =>
  `# Available core wallets Docker images
${wallets
    .map(
      wallet =>
        `${wallet.name}
- DockerHub [${wallet.latest}](https://hub.docker.com/r/${organization.toLowerCase()}/${wallet.canonicalName}d/)
- Github https://github.com/${organization}/${wallet.canonicalName}d`
    )
    .join('\n\r')}`;

module.exports = template;
