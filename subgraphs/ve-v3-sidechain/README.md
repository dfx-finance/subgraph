# VE v3 Sidechain

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
$ graph deploy --studio dfx-ve-v3-<sidechain>
```

(Prod) Goldsky

```bash
$ goldsky subgraph deploy ve-v3-<sidechain>/<version> --path .
```
