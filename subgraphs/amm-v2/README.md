# DFX V2 Subgraph

Any USD base pair created by the [DFX factory](https://etherscan.io/address/0xd3C1bF5582b5f3029b15bE04a49C65d3226dFB0C) is tracked by this subgraph.
The subgraph tracks DFX for daily and hourly historical data on TVLs and volumes.

Currently there are _6_ USD based stablecoin pairs on mainnet and _5_ on polygon.

### Mainnet

- Canada - [USDC/CADC](https://etherscan.io/address/0xa6c0cbcaebd93ad3c6c94412ec06aaa37870216d)
- Europe - [USDC/EURS](https://etherscan.io/address/0x1a4Ffe0DCbDB4d551cfcA61A5626aFD190731347)
- Indonesia - [USDC/XIDR](https://etherscan.io/address/0xdd39379ab7c93b9baae29e6ec03795d0bc99a889)
- New Zealand - [USDC/NZDS](https://etherscan.io/address/0xe9669516e09f5710023566458f329cce6437aaac)
- Singapore - [USDC/XSGD](https://etherscan.io/address/0x2baB29a12a9527a179Da88F422cDaaA223A90bD5)
- Turkey - [USDC/TRYB](https://etherscan.io/address/0xc574a613a3900e4314da13eb2287f13689a5b64d)

### Polygon

- Canada - [USDC/CADC](https://etherscan.io/address/0x8e3e9cB46E593Ec0CaF4a1Dcd6DF3A79a87b1fd7)
- Europe - [USDC/EURS](https://etherscan.io/address/0xB72d390E07F40D37D42dfCc43E954Ae7c738Ad44)
- New Zealand - [USDC/NZDS](https://etherscan.io/address/0x6e01699eF5C36DCe95D627B2E29E8323a086122c)
- Singapore - [USDC/XSGD](https://etherscan.io/address/0x288Ab1b113C666Abb097BB2bA51B8f3759D7729e)
- Turkey - [USDC/TRYB](https://etherscan.io/address/0xfCBb946CbC0434a541433E97e835072f54a438F6)

## Setup

1. Go to `https://thegraph.com/studio/`
2. Connect your MetaMask wallet and sign (This will not cost you any ETH)
3. Create a subgraph called 'dfx-ammv2-test'
4. Install The Graph's CLI on your terminal `npm install -g @graphprotocol/graph-cli`
5. Clone this repo `git clone https://github.com/dfx-finance/subgraph.git`
6. Install dependencies `yarn install`
7. Go into the directory `cd subgraph`

## Deploy

1. Generate the code from the schema `yarn codegen` (This should be done everytime the schema is changed)
2. Copy the Deploy Key from `https://thegraph.com/studio/` under 'dfx-test'
3. In your command line, `graph auth --studio`
4. Paste your Deploy Key when prompted
5. Deploy to your instance `yarn deploy-test:mainnet`
6. Set version to 'v0.0.1' and increment as you update the schema and source code.
7. Go back to `https://thegraph.com/studio/dfx-amm-v2` and you can start querying in the `Playground` even before the subgraph has synced to 100%
8. Run this query to get the latest trades ordered from newest to oldest
