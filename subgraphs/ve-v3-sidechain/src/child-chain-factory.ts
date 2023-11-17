import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { Registered as RegisteredEvent } from "../generated/ChildChainFactory/ChildChainFactory";
import { ChildChainReceiver as ReceiverContract } from "../generated/ChildChainFactory/ChildChainReceiver";
import { ChildChainStreamer as StreamerContract } from "../generated/ChildChainFactory/ChildChainStreamer";
import { RewardsOnlyGauge as GaugeContract } from "../generated/ChildChainFactory/RewardsOnlyGauge";
import {
  ChildChainFactory,
  GaugeSet,
  Receiver,
  Streamer,
  Gauge,
} from "../generated/schema";
import {
  Gauge as GaugeTemplate,
  Receiver as ReceiverTemplate,
} from "../generated/templates";
import { valueToBigDecimal } from "./helpers";

import { ZERO_BI, ZERO_BD } from "./helpers";

class ReceiverInfo {
  constructor(
    public whitelistedSender: Address,
    public whitelistedSourceChain: i32
  ) {}
}
export function fetchReceiverInfo(receiverAddr: Address): ReceiverInfo {
  const receiverContract = ChildChainReceiver.bind(receiverAddr);
  const whitelistedSender = receiverContract.whitelistedSender();
  const whitelistedSourceChain = receiverContract.whitelistedSourceChain();

  return new ReceiverInfo(whitelistedSender, whitelistedSourceChain);
}

class StreamerInfo {
  constructor() {}
}
export function fetchStreamerInfo(receiverAddr: Address): StreamerInfo {
  return new StreamerInfo();
}

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
  // create parent mapping
  let gaugeSet = GaugeSet.load(event.params.rootGauge.toHexString());
  if (gaugeSet === null) {
    gaugeSet = new GaugeSet(event.params.rootGauge.toHexString());
    gaugeSet.factory = event.address.toHexString();
    gaugeSet.receiver = event.params.receiver.toHexString();
    gaugeSet.streamer = event.params.streamer.toHexString();
    gaugeSet.gauge = event.params.childGauge.toHexString();
  }

  // create child mappings -- receiver
  let receiver = Receiver.load(event.params.receiver.toHexString());
  if (receiver === null) {
    const receiverInfo = fetchReceiverInfo(event.params.receiver);
    receiver = new Receiver(event.params.receiver.toHexString());
    receiver.set = gaugeSet.id;
    receiver.whitelistedSourceChain = receiverInfo.whitelistedSourceChain;
    receiver.whitelistedSender = receiverInfo.whitelistedSender;
  }
  receiver.save();

  // create child mappings -- streamer
  let streamer = Streamer.load(event.params);
  if (streamer === null) {
    const streamerInfo = fetchStreamerInfo(event.params.streamer);
    streamer = new Streamer(event.params.streamer.toHexString());
    streamer.set = gaugeSet.id;
    streamer.reward_count = ZERO_BD;
    streamer.last_update_time = ZERO_BI;
  }
  streamer.save();

  // create child mappings -- gauge
  let gauge = Gauge.load(event.params.childGauge.toHexString());
  if (gauge === null) {
    const gaugeInfo = fetchGaugeInfo(event.params.childGauge);
    gauge = new Gauge(event.params.childGauge.toHexString());
    gauge.set = gaugeSet.id;
    gauge.decimals = gaugeInfo.decimals;
    gauge.name = gaugeInfo.name;
    gauge.symbol = gaugeInfo.symbol;
    gauge.totalSupply = gaugeInfo.totalSupply;
    gauge.lpt = gaugeInfo.lpt;
    gauge.lptAmount = ZERO_BD;
  }
  gauge.save();

  // create relations on parent
  gaugeSet.receiver = receiver.id;
  gaugeSet.streamer = streamer.id;
  gaugeSet.gauge = gauge.id;
  gaugeSet.save();

  ReceiverTemplate.create(event.params.receiver);
  GaugeTemplate.create(event.params.childGauge);
}
