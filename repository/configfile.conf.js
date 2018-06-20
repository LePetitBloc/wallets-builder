const template = ({ rpcuser, rpcpassword, mainRpcPort }) =>
  `rpcuser=${rpcuser}
rpcpassword=${rpcpassword}
rpcport=${mainRpcPort}`;

module.exports = template;
