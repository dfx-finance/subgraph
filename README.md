# DFX Subgraphs

## Documentation

Full documentation on how to use GraphQL queries in The Graph playground can be found [here](https://docs.dfx.finance/protocol/api/dfx-subgraphs).

## Deploy on TheGraph's Subgraph Studio

1. Login CLI tools to Subgraph Studio (`graph auth --studio <key>`)
2. Enter subgraph: `cd subgraphs/<subgraph-name>`
3. Build subgraph: `graph codegen && graph build`
4. Deploy: `graph deploy --studio <subgraph-studio-name>`

## Production Deploys

See the README in each subgraph's respective package:

- [AMMv1](/subgraphs/amm-v1/README.md)
- [AMMv2](/subgraphs/amm-v2/README.md)
- [AMMv3](/subgraphs/amm-v3/README.md)
- [ASC](/subgraphs/asc/README.md) (dfxStables)
- [VEv2](/subgraphs/ve-v2/README.md)
- [VEv3](/subgraphs/v3-v2/README.md)

## Debugging

### Common issues

One of the most common issues when changing the schema is all specified fields except for the id must be initialized or the subgraph will fail to index.
<br/>
For example given this schema for the parent factory contract

```graphql:
type DFXFactory @entity {
  # factory address
  id: ID!

  # pair info
  pairCount: Int!

  # total volume
  totalVolumeUSD: BigDecimal!

  # total liquidity
  totalLiquidityUSD: BigDecimal!
  # transactions
  # txCount: BigInt!
}
```

The subsequent mapping definition must have all fields present and defined.

```typescript:
factory = new DFXFactory(FACTORY_ADDRESS);
factory.pairCount = 0;
factory.totalVolumeUSD = ZERO_BD;
factory.totalLiquidityUSD = ZERO_BD;
```

Configuration constants must be lowercase
Bad Example

```
0x84Bf8151394dcF32146965753B28760550f3D7A8
```

Good Example

```
0x84bf8151394dcf32146965753b28760550f3d7a8
```

Switching from mainnet to polygon and vice versa requires a small change in `subgraph\src\helpers.ts`.

In `fetchRewardsForDuration()` there is a function that makes calls to the staking contracts `contract.getRewardForDuration()` in mainnet it is just 1 BigDecimal but polygon the number is inside an array so upon switching between the two there needs to be a small change of `contract.getRewardForDuration()[0]`.

### Logging

To help with debugging the The Graph has provided a logging object within the `graph-ts` module.

```typescript:
import { log } from "@graphprotocol/graph-ts";
```

This can be used almost anywhere in your mapping code the provide insight on values that are being defined on your schema. There are four different types of logs that can be defined `error, warn, info, debug` They all follow the format of `string` message followed by and `string` array filled wih your variables. They will show up after the subgraph is deployed.
<br/>
For example

```typescript:
log.debug("The amount of pairs currently in dfx is {}", [
  factory.pairCount.toString(),
]);
```

Note: Addresses and transaction hashes must be converted to Hexstrings in order to show up properly in the logging.
