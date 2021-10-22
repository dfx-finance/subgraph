# DFX V1 Subgraph

Any USD base pair created by the [DFX factory](https://etherscan.io/address/0xd3C1bF5582b5f3029b15bE04a49C65d3226dFB0C) is tracked by this subgraph. 
The subgraph tracks DFX for daily and hourly historical data on TVLs and volumes.

Currently there are *5* USD based stablecoin pairs.

### Mainnet

* Singapore - [USDC/XSGD](https://etherscan.io/address/0x2baB29a12a9527a179Da88F422cDaaA223A90bD5)
* Europe - [USDC/EURS](https://etherscan.io/address/0x1a4Ffe0DCbDB4d551cfcA61A5626aFD190731347)
* Canada - [USDC/CADC](https://etherscan.io/address/0xa6c0cbcaebd93ad3c6c94412ec06aaa37870216d)
* New Zealand - [USDC/NZDS](https://etherscan.io/address/0xe9669516e09f5710023566458f329cce6437aaac)
* Turkey - [USDC/TRYB](https://etherscan.io/address/0xc574a613a3900e4314da13eb2287f13689a5b64d)

### Polygon

* Singapore - [USDC/XSGD](https://etherscan.io/address/0x288Ab1b113C666Abb097BB2bA51B8f3759D7729e)
* Europe - [USDC/EURS](https://etherscan.io/address/0xB72d390E07F40D37D42dfCc43E954Ae7c738Ad44)
* Canada - [USDC/CADC](https://etherscan.io/address/0x8e3e9cB46E593Ec0CaF4a1Dcd6DF3A79a87b1fd7)

## Setup

1. Go to `https://thegraph.com/studio/`
2. Connect your MetaMask wallet and sign (This will not cost you any ETH)
3. Create a subgraph called 'dfx-test' 
4. Install The Graph's CLI on your terminal `npm install -g @graphprotocol/graph-cli`
5. Clone this repo `git clone https://github.com/dfx-finance/subgraph.git`
6. Install dependencies `yarn install`
6. Go into the directory `cd subgraph`

## Deploy
1. Generate the code from the schema `yarn codegen` (This should be done everytime the schema is changed)
2. Copy the Deploy Key from `https://thegraph.com/studio/` under 'dfx-test'
3. In your command line, `graph auth --studio`
4. Paste your Deploy Key when prompted
5. Deploy to your instance `yarn deploy`
6. Set version to 'v0.0.1' and increment as you update the schema and source code.
7. Go back to `https://thegraph.com/studio/dfx-test` and you can start querying in the `Playground` even before the subgraph has synced to 100%
8. Run this query to get the latest trades ordered from newest to oldest

## Deploy Legacy Explorer (Hosted)
1. `graph auth --product hosted-service <Access Token>`
2. `graph deploy --product hosted-service chanharryhk/dfx-v1` 

```graphql:
{
  trades(
    orderBy: createdAtTimestamp
    orderDirection: desc
    where: {createdAtTimestamp_gte: 1631670701, createdAtTimestamp_lt: 1631685194}
  ) {
    id
    createdAtTimestamp
    trader
    origin
    target
    originAmount
    targetAmount
  }
}
```
Full documentation on how to use GraphQL queries in The Graph playground can be found [here](https://thegraph.com/docs/developer/graphql-api).

## Schema Overview

### DFXFactory, DFXDayData
Contains information across of all DFX pools. Overall and daily data is sepertaed by each type resepectively.

### Trade
Contains information everytime a swap is made within any of the stablecoin pairs that are created by the DFX factory. This includes which token is being swaped as well as the respective amount.

### Transfer
Contains information everytime tokens are moved in and out of each of the stablecoin pools. This includes which token is being moved as well as the respective amount.

### Pair, PairDayData, PairHourData
Contains combined and individual volume and TVL on each of the curve pools. Overall, daily and hourly data is seperated by each type respectively.

### Token
Contains the address and decimals a token has.

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
factory = new DFXFactory(FACTORY_ADDRESS)
factory.pairCount = 0
factory.totalVolumeUSD = ZERO_BD
factory.totalLiquidityUSD = ZERO_BD
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
### Logging
To help with debugging the The Graph has provided a logging object within the `graph-ts` module.
```typescript:
import { log } from "@graphprotocol/graph-ts";
```
This can be used almost anywhere in your mapping code the provide insight on values that are being defined on your schema. There are four different types of logs that can be defined `error, warn, info, debug` They all follow the format of `string` message followed by and `string` array filled wih your variables. They will show up after the subgraph is deployed.
<br/>
For example
```typescript:
log.debug("The amount of pairs currently in dfx is {}", [factory.pairCount.toString()])
```
Note: Addresses and transaction hashes must be converted to Hexstrings in order to show up properly in the logging.
