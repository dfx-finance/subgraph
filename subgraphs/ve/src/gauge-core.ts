import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DFX_DISTRIBUTOR_PROXY } from "../../../packages/constants";
import { Gauge } from "../generated/schema";

import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Transfer as TransferEvent,
} from "../generated/templates/Gauge/liquidityGaugeV4";
import { valueAsBigDecimal } from "./helpers";

// /* -- Main -- */
export function handleDeposit(event: DepositEvent): void {
  const gauge = Gauge.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = BigInt.fromString("18");
    const amount = valueAsBigDecimal(event.params.value, lptDecimals);
    gauge.totalSupply = gauge.totalSupply.plus(amount);
    gauge.blockNumber = event.block.number;
    gauge.save();
  }
}

export function handleWithdraw(event: WithdrawEvent): void {
  const gauge = Gauge.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = BigInt.fromString("18");
    const amount = valueAsBigDecimal(event.params.value, lptDecimals);
    gauge.totalSupply = gauge.totalSupply.minus(amount);
    gauge.blockNumber = event.block.number;
    gauge.save();
  }
}

export function handleTransfer(event: TransferEvent): void {
  const gaugeAddr = event.address.toHexString();
  const gauge = Gauge.load(gaugeAddr);
  if (gauge) {
    // parse event
    const dfxDecimals = BigInt.fromString("18");
    const amount = valueAsBigDecimal(event.params._value, dfxDecimals);
    const _fromAddr = event.params._from;
    const _dfxDistributorAddr = Address.fromString(DFX_DISTRIBUTOR_PROXY);
    const _gaugeAddr = Address.fromString(gaugeAddr);

    // add inbound transfers
    if (_fromAddr === _dfxDistributorAddr) {
      gauge.dfxBalance = gauge.dfxBalance.plus(amount);
    }
    // subtract outbout transfers
    else if (_fromAddr === _gaugeAddr) {
      gauge.dfxBalance = gauge.dfxBalance.minus(amount);
    }

    gauge.save();
  }
}
