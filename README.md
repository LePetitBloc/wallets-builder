# wallets-builder
Generic **core wallets** builder based ont the data provided by [lepetitbloc/wallets](https://github.com/LePetitBloc/wallets) project.

# Usage
If a `Dockerfile` exists for a given wallet in `./wallets/wallet` directory, the image will be built uppon this file.
If it doesn't it will default to the `Dockerfile` in the **parent** wallet directory.
> If none is found the image just simply won't be built.

```
npm run build
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

# Licence
MIT
