# ve

## Events Watched

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
- Transfer: updates amount distributed from gauge to user addresses

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
    totalSupply
    workingSupply
    dfxBalance
    rewardCount
    totalWeight
    active
    blockNum
  }
}
```
