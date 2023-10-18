# AMMv3 Subgraph

## Config

Networks:

- `mainnet`
- `polygon`
- `arbitrum`

Each network contains a `./config` with its addresses and constant values.

## Build

1. Generate a `subgraph.yaml` with network values populated by config file.

```bash
$ yarn prepare:<network>`
```

2. Build subgraph

```bash
$ graph codegen && graph build
```

## Deploy

```bash
$ graph deploy --studio dfx-amm3
```
