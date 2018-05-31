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

## Donation

If you have not already understand, we love cryptocurrency. It's possible to make a donation
for this work at the following addresses:

| Currency         | Address                                    |
| ---------------- | ------------------------------------------ |
| Bitcoin          | 14VRBrDZ47HR1pWjmAnyC5CJCXDkhLeANb         |
| Ethereum         | 0x1accf4c2bd6010100a2aeac36f336fb963a1716a |
| Ethereum Classic | 0x3b33bdcc70f06dad7068594a0cd8fbfd7b203aae |
| Litecoin         | LdH6Sbq5M9p6dqG7GaRvBjoCqJ2CHnz9wr         |
| Dash             | XuPyN4Ns12qaMKzUjffzeKrCjCL4XYwUCY         |
| ZCash            | t1U2e4TV6zmg6gXAByBp59NtBP2HsEvY5T5        |
| Doge             | DKbojeYrguCL2Suh9ujmU49m4QK9DixBXL         |

## Code of conduct

See the [CODE OF CONDUCT](CODE_OF_CONDUCT.md) file.

## Contributing

See the [CONTRIBUTING](CONTRIBUTING.md) file.

## License

This project is under the [MIT License](LICENSE.md).

## Support

See the [SUPPORT](SUPPORT.md) file.

## Credits

- README, CONTRIBUTING and LICENSE are heavily inspired by [project-template](https://github.com/mnapoli/project-template)
- Issue and Pull Request templates comes from [Open-Source Templates](https://www.talater.com/open-source-templates/#/)
- CODE_OF_CONDUCT come from [Contributor Covenant](https://www.contributor-covenant.org)
