# wallets-builder
Generic **core wallets** builder based ont the data provided by [lepetitbloc/wallets](https://github.com/LePetitBloc/wallets) project.

# Usage
If a `Dockerfile` exists for a given wallet in `./wallets/wallet` directory, the image will be built uppon this file.
If it doesn't it will default to the `Dockerfile` in the **parent** wallet directory.
> If none is found the image just simply won't be built.

```
make build
```

> This will internally:
> 1. Build the image.
> 2. Creates the `goss` specification file.
> 3. Test it with `dgoss`.
> 4. Publish it.

# Available images
See the [list of a available core wallets images](WALLETS.md).

# Roadmap
* Fetch the `Dockerfile` from a dedicated repository.

## Contributing

See the [CONTRIBUTING](CONTRIBUTING.md) file.

## License

This project is under the [MIT License](LICENSE.md).

## Donation
We love cryptocurrencies, consider making a donation:

| Currency         | Address                                    |
| ---------------- | ------------------------------------------ |
| Bitcoin          | 14VRBrDZ47HR1pWjmAnyC5CJCXDkhLeANb         |
| Ethereum         | 0x1accf4c2bd6010100a2aeac36f336fb963a1716a |
| Ethereum Classic | 0x3b33bdcc70f06dad7068594a0cd8fbfd7b203aae |
| Litecoin         | LdH6Sbq5M9p6dqG7GaRvBjoCqJ2CHnz9wr         |
| Dash             | XuPyN4Ns12qaMKzUjffzeKrCjCL4XYwUCY         |
| ZCash            | t1U2e4TV6zmg6gXAByBp59NtBP2HsEvY5T5        |
| Doge             | DKbojeYrguCL2Suh9ujmU49m4QK9DixBXL         |
