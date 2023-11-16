# ve

### Test Deploy (TheGraph Subgraph Studio)

Test URI: https://thegraph.com/studio/subgraph/dfx-ve-v3/

Run codegen:

```bash
$ graph codegen && graph build
$ graph deploy --studio dfx-ve-v3
```

### Prod Deploy (Goldsky)

```bash
$ goldsky subgraph deploy ve-v3/X.X.X
```

## Events Watched

- veDFX
  - Supply
- GaugeController
  - NewGauge: creates new gauge entity to track in subgraph
- DfxDistributor
  - GaugeToggled: updates addr and boolean rewards state for a given gauge registered with GaugeController
- LiquidityGaugeV4
  - Deposit: updates amount of lpt deposited within gauge
  - Withdrawal: updates amount of lpt deposited within gauge

## Example Queries

- [Active Gauges](/examples/active-gauges.graphql): All active gauges and their current values
- [Curve and Gauge](/examples/curve-gauge.graphql): EURC/USDC gauge and curve (pair)
- [GaugeController and Distributor](/examples/gaugecontroller-distributor.graphql): Gauge controller and DFX distributor data

### Dev notes

The subgraph is considerably slower to index after adding the APR calculation. The APR calculation relies on knowing the USD value of available rewards requiring an external read call to Balancer pools.
