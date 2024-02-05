# DFX V2 Subgraph

Any USD base pair created by the [DFX factory](https://etherscan.io/address/0xd3C1bF5582b5f3029b15bE04a49C65d3226dFB0C) is tracked by this subgraph.
The subgraph tracks DFX for daily and hourly historical data on TVLs and volumes.

Currently there are _x_ USD based stablecoin pairs on mainnet, _x_ on Polygon and _x_ on Arbitrum.

### Mainnet

- Canada - [CADC/USDC](https://etherscan.io/address/<addr>)
- Europe - [EURS/USDC](https://etherscan.io/address/<addr>)
- Indonesia - [XIDR/USDC](https://etherscan.io/address/<addr>)
- New Zealand - [NZDS/USDC](https://etherscan.io/address/<addr>)
- Singapore - [XSGD/USDC](https://etherscan.io/address/<addr>)
- Turkey - [TRYB/USDC](https://etherscan.io/address/<addr>)

### Polygon

- Canada - [CADC/USDC](https://etherscan.io/address/<addr>)
- Europe - [EURS/USDC](https://etherscan.io/address/<addr>)
- Singapore - [XSGD/USDC](https://etherscan.io/address/<addr>)
- Turkey - [TRYB/USDC](https://etherscan.io/address/<addr>)

Each network contains a `./config/<network>.json` file with constant chain addresses and values.

## Build

Generate a `subgraph.yaml` with using config file and build.

```bash
$ yarn prepare:<network>
$ graph codegen && graph build
```

## Deploy

(Dev) Subgraph Studio:

```bash
$ graph deploy --studio dfx-amm-v3
```

(Prod) Goldsky

```bash
$ goldsky subgraph deploy amm-v3/<version> --path .
```

## Post Deploy

Tag version as "latest" on subgraph:

```bash
$ goldsky subgraph tag create amm-v3/<version> --tag latest
```
