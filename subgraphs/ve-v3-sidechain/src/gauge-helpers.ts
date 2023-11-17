import { Address } from "@graphprotocol/graph-ts";
import { Gauge } from "../generated/schema";
import { fetchGaugeInfo } from "./child-chain-factory";
import { RewardsOnlyGauge as GaugeContract } from "../generated/templates/Gauge/RewardsOnlyGauge";
import { ERC20 as ERC20Contract } from "../generated/templates/Gauge/ERC20";
import { valueToBigDecimal } from "./helpers";

import { DFX_L2 } from "../../../packages/constants";

// Get or create Gauge entity with default empty state
export function getGauge(gaugeAddr: string): Gauge {
  let gauge = Gauge.load(gaugeAddr);
  if (gauge === null) {
    const _addr = Address.fromString(gaugeAddr);
    const gaugeInfo = fetchGaugeInfo(_addr);

    gauge = new Gauge(gaugeAddr);
    gauge.decimals = gaugeInfo.decimals;
    gauge.name = gaugeInfo.name;
    gauge.symbol = gaugeInfo.symbol;
    gauge.totalSupply = gaugeInfo.totalSupply;
  }
  return gauge;
}

/* -- Helpers -- */
// Update the total DFX available (unclaimed and undistributed) in gauge
export function _updateDfxBalance(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);

  const dfxContract = ERC20Contract.bind(Address.fromString(DFX_L2));
  const rewardAmount = valueToBigDecimal(dfxContract.balanceOf(gaugeAddr), 18);

  gauge.dfxBalance = rewardAmount;
}

// Update the total amount of veDFX provided to gauge
export function _updateTotalSupply(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = GaugeContract.bind(gaugeAddr);

  const totalSupply = gaugeContract.totalSupply();
  const dfxDecimals = 18;

  gauge.totalSupply = valueToBigDecimal(totalSupply, dfxDecimals);
}
