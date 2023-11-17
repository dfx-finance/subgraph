import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { Registered as RegisteredEvent } from "../generated/ChildChainFactory/ChildChainFactory";
import { RewardsOnlyGauge } from "../generated/ChildChainFactory/RewardsOnlyGauge";
import {
  ChildChainFactory,
  GaugeSet,
  Receiver,
  Gauge,
} from "../generated/schema";
import {
  Gauge as GaugeTemplate,
  Receiver as ReceiverTemplate,
} from "../generated/templates";
import { valueToBigDecimal } from "./helpers";

import { ZERO_BI } from "./helpers";

class GaugeInfo {
  constructor(
    public decimals: i32,
    public name: string,
    public symbol: string,
    public totalSupply: BigDecimal,
    public lpt: Address
  ) {}
}
export function fetchGaugeInfo(gaugeAddr: Address): GaugeInfo {
  const gaugeContract = RewardsOnlyGauge.bind(gaugeAddr);
  const decimals = gaugeContract.decimals().toI32();
  const name = gaugeContract.name();
  const symbol = gaugeContract.symbol();
  const totalSupply = valueToBigDecimal(gaugeContract.totalSupply(), 18);

  const lpt = gaugeContract.lp_token();

  return new GaugeInfo(decimals, name, symbol, totalSupply, lpt);
}

export function getGaugeFactory(factoryAddr: string): ChildChainFactory {
  let gaugeFactory = ChildChainFactory.load(factoryAddr);
  if (gaugeFactory === null) {
    gaugeFactory = new ChildChainFactory(factoryAddr);
    gaugeFactory.numGauges = ZERO_BI;
  }
  return gaugeFactory;
}

export function handleNewGaugeSet(event: RegisteredEvent): void {
  let gaugeFactory = getGaugeFactory(event.address.toHexString());

  let gaugeSet = GaugeSet.load(event.params.rootGauge.toHexString());
  if (gaugeSet === null) {
    gaugeSet = new GaugeSet(event.params.rootGauge.toHexString());
    gaugeSet.factory = event.address.toHexString();
    gaugeSet.receiver = event.params.receiver.toHexString();
    gaugeSet.streamer = event.params.streamer.toHexString();
    gaugeSet.gauge = event.params.childGauge.toHexString();
  }
  gaugeSet.save();

  ReceiverTemplate.create(event.params.receiver);
  GaugeTemplate.create(event.params.childGauge);
}
