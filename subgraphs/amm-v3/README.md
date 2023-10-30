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

(Dev) Subgraph Studio:

```bash
$ graph deploy --studio dfx-amm3
```

(Prod) Goldsky

```bash
$ goldsky subgraph deploy amm-v3/<version> --path .
```
