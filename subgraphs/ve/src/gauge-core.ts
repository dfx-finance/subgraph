import { Bytes } from "@graphprotocol/graph-ts";
import { Gauge } from "../generated/schema";

import {
  liquidityGaugeV4,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
} from "../generated/templates/Gauge/liquidityGaugeV4";
import { ZERO_BI } from "./helpers";

/* -- Helpers -- */
export function getGauge(addr: Bytes): Gauge {
  const gaugeContract = liquidityGaugeV4.bind(addr);
  let gauge = Gauge.load(addr.toString());
  if (gauge === null) {
    gauge = new Gauge(addr.toHexString());
    gauge.address = addr;
    gauge.lpt = gaugeContract.staking_token();
    gauge.lptAmount = gaugeContract.totalSupply();
    gauge.symbol = gaugeContract.symbol();
    gauge.totalWeight = ZERO_BI;
  }
  gauge.save();
  return gauge;
}

/* -- Main -- */
export function handleDeposit(event: DepositEvent) {
  const gauge = getGauge(event.address);
  gauge.totalWeight = gauge.totalWeight.plus(event.params.value);
  gauge.save();
}

export function handleWithdraw(event: WithdrawEvent) {
  const gauge = getGauge(event.address);
  gauge.totalWeight = gauge.totalWeight.minus(event.params.value);
  gauge.save();
}
