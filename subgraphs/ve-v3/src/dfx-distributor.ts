import { Address } from "@graphprotocol/graph-ts";
import { DFX_GAUGE_CONTROLLER_V3 } from "../../../packages/constants";
import {
  DfxDistributor as DfxDistributorContract,
  GaugeToggled as GaugeToggledEvent,
  RewardDistributed as RewardDistributedEvent,
  UpdateMiningParameters as UpdateMiningParametersEvent,
} from "../generated/DfxDistributor/DfxDistributor";
import { DfxDistributor, LiquidityGaugeV4 } from "../generated/schema";
import { getActiveGauges } from "./gauge-controller";
import { DFX_DECIMALS, ZERO_BD, ZERO_BI, valueToBigDecimal } from "./helpers";

/* -- Helpers -- */
export function getDfxDistributor(distributorAddr: Address): DfxDistributor {
  let dfxDistributor = DfxDistributor.load(distributorAddr.toHexString());
  if (dfxDistributor === null) {
    dfxDistributor = new DfxDistributor(distributorAddr.toHexString());
    dfxDistributor.epoch = 0;
    dfxDistributor.rate = ZERO_BI;
    dfxDistributor.startEpochSupply = ZERO_BD;
    dfxDistributor.startEpochTime = 0;
  }
  return dfxDistributor;
}

function _updateDfxDistributorAttributes(distributorAddr: Address): void {
  const dfxDistributorContract = DfxDistributorContract.bind(distributorAddr);
  const dfxDistributor = getDfxDistributor(distributorAddr);

  dfxDistributor.epoch = dfxDistributorContract.miningEpoch().toI32();
  dfxDistributor.rate = dfxDistributorContract.rate();
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

  const gauge = LiquidityGaugeV4.load(addr.toHexString());
  if (gauge) {
    gauge.active = isActive;
    gauge.save();
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
    const gauge = LiquidityGaugeV4.load(gaugeAddrs[i].toHexString());
    if (gauge) {
      gauge.startProportionalWeight = gauge.proportionalWeight;
      gauge.weightDelta = ZERO_BD;
      gauge.save();
    }
  }
}

export function handleUpdateMiningParameters(
  event: UpdateMiningParametersEvent
): void {
  _updateDfxDistributorAttributes(event.address);
}
