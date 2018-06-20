const template = ({ baseBinary, requiredTokens, symbol }) =>
  `# FAQ

## The \`masternode outputs\` return an empty object.
\`\`\`
{
}
\`\`\`

You must receive the **${requiredTokens} ${symbol}** for the **masternode** in a single transaction on your **Control Wallet** and wait for at least 1 confirmation.
> If you already have the **${requiredTokens} ${symbol}** but it came from multiple transactions, you can send the **${requiredTokens} ${symbol}** back to yourself:
\`\`\`
docker exec ${baseBinary}-wallet ${baseBinary}-cli sendfrom "" YoUrAdDr3Ss ${symbol}
\`\`\`

## Running a **wallet** or a **masternode** container result in the following error:
\`\`\`
No such file or directory
\`\`\`

Ensure the \`data\` folder is *writable* for the container.
`;

module.exports = template;
