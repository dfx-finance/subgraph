# ve

## Events Watched

### veDFX

Events:

- Supply

### GaugeController

Events:

- NewGauge: creates new gauge entity to track in subgraph

### DfxDistributor

Events:

- GaugeToggled: updates addr and boolean rewards state for a given gauge registered with GaugeController

### LiquidityGaugeV4:

Events:

- Deposit: updates amount of lpt deposited within gauge
- Withdrawal: updates amount of lpt deposited within gauge

## Example Queries

#### Gauges

Return all active gauges and their current values

```
{
  gauges(where: {active: true}) {
    id
    decimals
    symbol
    lpt
    lptAmount
    workingSupply
    totalSupply
    dfxBalance
    rewardCount
    minApr
    maxApr
    active
    blockNum
  }
}
```

Return EUROC/USDC gauge and curve (pair):

```
{
  gauge(id: "0x1e07d4dad0614a811a12bdcd66016f48c6942a60") {
    id
    decimals
    symbol
    lpt
    lptAmount
    workingSupply
    totalSupply
    dfxBalance
    rewardCount
    minApr
    maxApr
    active
    blockNum
  }
  pair(id: "0x8cd86fbc94bebfd910caae7ae4ce374886132c48") {
    id
    supply
    reserveUSD
  }
}
```

## Dev notes

The subgraph is considerably slower to index after adding the APR calculation. The APR calculation relies on knowing the USD value of available rewards requiring an external read call to Balancer pools.
