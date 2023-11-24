import { Address } from "@graphprotocol/graph-ts";
import { DFX_GAUGE_CONTROLLER_V3 } from "../../../packages/constants";
import {
  DfxDistributor as DfxDistributorContract,
  GaugeToggled as GaugeToggledEvent,
  RewardDistributed as RewardDistributedEvent,
  UpdateMiningParameters as UpdateMiningParametersEvent,
} from "../generated/DfxDistributor/DfxDistributor";
import {
  DfxDistributor,
  LiquidityGaugeV4,
  RootGauge,
} from "../generated/schema";
import { getActiveGauges } from "./gauge-controller";
import {
  DFX_DECIMALS,
  ONE_BI,
  ZERO_BD,
  ZERO_BI,
  valueToBigDecimal,
} from "./helpers";
import { _updateRewardsAvailable } from "./gauge-helpers";

/* -- Helpers -- */
export function getDfxDistributor(distributorAddr: Address): DfxDistributor {
  let dfxDistributor = DfxDistributor.load(distributorAddr.toHexString());
  if (dfxDistributor === null) {
    dfxDistributor = new DfxDistributor(distributorAddr.toHexString());
    dfxDistributor.epoch = 0;
    dfxDistributor.rate = ZERO_BD;
    dfxDistributor.nextRate = ZERO_BD;
    dfxDistributor.startEpochSupply = ZERO_BD;
    dfxDistributor.startEpochTime = 0;
  }
  return dfxDistributor;
}

function _updateDfxDistributorAttributes(distributorAddr: Address): void {
  const dfxDistributorContract = DfxDistributorContract.bind(distributorAddr);
  const dfxDistributor = getDfxDistributor(distributorAddr);

  dfxDistributor.epoch = dfxDistributorContract.miningEpoch().toI32();
  dfxDistributor.rate = valueToBigDecimal(dfxDistributorContract.rate(), 18);
  dfxDistributor.nextRate = dfxDistributor.rate.div(
    valueToBigDecimal(dfxDistributorContract.RATE_REDUCTION_COEFFICIENT(), 18)
  );
  dfxDistributor.startEpochSupply = valueToBigDecimal(
    dfxDistributorContract.startEpochSupply(),
    DFX_DECIMALS
  );
  dfxDistributor.startEpochTime = dfxDistributorContract
    .startEpochTime()
    .toU32();
  dfxDistributor.save();
}

/* -- Main -- */
/* Event Handlers */
// Watch GaugeToggled event to mark whether a gauge is "active" or "inactive"
export function handleGaugeToggled(event: GaugeToggledEvent): void {
  const addr = event.params.gaugeAddr;
  const isActive = !event.params.newStatus;

  const mainnetGauge = LiquidityGaugeV4.load(addr.toHexString());
  if (mainnetGauge) {
    mainnetGauge.active = isActive;
    mainnetGauge.save();
  }
  const l2Gauge = RootGauge.load(addr.toHexString());
  if (l2Gauge) {
    l2Gauge.active = isActive;
    l2Gauge.save();
  }
}

export function handleRewardDistributed(event: RewardDistributedEvent): void {
  // -- DFX Distributor
  _updateDfxDistributorAttributes(event.address);

  // -- Gauges
  // Set the current weights as the starting weight on each gauge and reset the newly
  // added weight counter
  const gaugeAddrs = getActiveGauges(
    Address.fromString(DFX_GAUGE_CONTROLLER_V3)
  );

  for (let i = 0; i < gaugeAddrs.length; i++) {
    const mainnetGauge = LiquidityGaugeV4.load(gaugeAddrs[i].toHexString());
    if (mainnetGauge) {
      mainnetGauge.startProportionalWeight = mainnetGauge.proportionalWeight;
      mainnetGauge.weightDelta = ZERO_BD;
      _updateRewardsAvailable(mainnetGauge);
      mainnetGauge.save();
    }
    const l2Gauge = RootGauge.load(gaugeAddrs[i].toHexString());
    if (l2Gauge) {
      l2Gauge.startProportionalWeight = l2Gauge.proportionalWeight;
      l2Gauge.weightDelta = ZERO_BD;
      l2Gauge.save();
    }
  }
}

export function handleUpdateMiningParameters(
  event: UpdateMiningParametersEvent
): void {
  _updateDfxDistributorAttributes(event.address);
}
