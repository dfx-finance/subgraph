import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Gauge,
  GaugeSet,
  Streamer,
  Receiver,
  // GaugeReward,
} from "../generated/schema";
import { ChildChainReceiver as ReceiverContract } from "../generated/ChildChainFactory/ChildChainReceiver";
import { ChildChainStreamer as StreamerContract } from "../generated/ChildChainFactory/ChildChainStreamer";
import { RewardsOnlyGauge as GaugeContract } from "../generated/ChildChainFactory/RewardsOnlyGauge";
import { ERC20 as ERC20Contract } from "../generated/templates/Gauge/ERC20";

import {
  CCIP_SENDER_ETH,
  CCIP_CHAIN_SELECTOR_ETH,
} from "../../../packages/constants";
import { ZERO_BD, ZERO_BI, valueToBigDecimal } from "./helpers";
import { DFX_L2 } from "../../../packages/constants";

/**
 * Fetch initial contract data to populate constructor() states
 */
class StreamerInfo {
  constructor(public rewardCount: i32, public lastUpdate: i64) {}
}
export function fetchStreamerInfo(streamerAddr: Address): StreamerInfo {
  const streamerContract = StreamerContract.bind(streamerAddr);
  const rewardCount = streamerContract.reward_count().toI32();
  const lastUpdate = streamerContract.last_update_time().toI64();
  return new StreamerInfo(rewardCount, lastUpdate);
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
  const gaugeContract = GaugeContract.bind(gaugeAddr);
  const decimals = gaugeContract.decimals().toI32();
  const name = gaugeContract.name();
  const symbol = gaugeContract.symbol();
  const totalSupply = valueToBigDecimal(gaugeContract.totalSupply(), 18);

  const lpt = gaugeContract.lp_token();

  return new GaugeInfo(decimals, name, symbol, totalSupply, lpt);
}

/**
 * Create default entities
 */
// Get or create GaugeSet entity with default state
export function getGaugeSet(rootGaugeAddr: Address): GaugeSet {
  let gaugeSet = GaugeSet.load(rootGaugeAddr.toHexString());
  if (gaugeSet === null) {
    gaugeSet = new GaugeSet(rootGaugeAddr.toHexString());
  }
  return gaugeSet;
}

// Get or create Receiver entity with default state
export function getReceiver(receiverAddr: Address): Receiver {
  let receiver = Receiver.load(receiverAddr.toHexString());
  if (receiver === null) {
    receiver = new Receiver(receiverAddr.toHexString());
  }
  return receiver;
}

// Get or create Streamer entity with default state
export function getStreamer(streamerAddr: Address): Streamer {
  let streamer = Streamer.load(streamerAddr.toHexString());
  if (streamer === null) {
    const streamerInfo = fetchStreamerInfo(streamerAddr);
    streamer = new Streamer(streamerAddr.toHexString());
    streamer.reward_count = streamerInfo.rewardCount;
    streamer.last_update = ZERO_BI;
  }
  return streamer;
}

// Get or create Gauge entity with default empty state
export function getGauge(gaugeAddr: Address): Gauge {
  let gauge = Gauge.load(gaugeAddr.toHexString());
  if (gauge === null) {
    const gaugeInfo = fetchGaugeInfo(gaugeAddr);
    gauge = new Gauge(gaugeAddr.toHexString());
    gauge.decimals = gaugeInfo.decimals;
    gauge.name = gaugeInfo.name;
    gauge.symbol = gaugeInfo.symbol;
    gauge.dfxBalance = ZERO_BD;
    gauge.totalSupply = gaugeInfo.totalSupply;
    gauge.lpt = gaugeInfo.lpt;
    gauge.lptAmount = ZERO_BD;
    gauge.blockNum = ZERO_BI;
  }
  return gauge;
}

// // Get or create GaugeReward entity with default empty state
// export function getGaugeReward(
//   gauge: Gauge,
//   rewardAddr: Address,
//   rewardIdx: i32
// ): GaugeReward {
//   const rewardId = gauge.id + "-" + rewardIdx.toString();
//   let gaugeReward = GaugeReward.load(rewardId);
//   if (gaugeReward === null) {
//     gaugeReward = new GaugeReward(rewardId);
//     gaugeReward.gauge = gauge.id;
//     gaugeReward.token = rewardAddr.toHexString();
//     gaugeReward.amount = ZERO_BD;
//   }
//   return gaugeReward;
// }

// /* -- Helpers -- */
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

// export function _updateRewardsAvailable(gauge: Gauge): void {
//   // iterate and update each gauge reward
//   const gaugeSet = getGaugeSet(Address.fromString(gauge.gaugeSet));
//   const streamerContract = StreamerContract.bind(
//     Address.fromString(gaugeSet.streamer)
//   );
//   const numRewards = streamerContract.reward_count().toI32();

//   for (let i: i32 = 0; i < numRewards; i++) {
//     const gaugeContract = StreamerContract.bind(Address.fromString(gauge.id));

//     // get rewards contract info
//     const rewardsAddr = gaugeContract.reward_tokens(BigInt.fromI32(i));
//     const rewardContract = ERC20Contract.bind(rewardsAddr);
//     const rewardDecimals = rewardContract.decimals();

//     // get weekly rewards
//     const rewardsRate = gaugeContract.reward_data(rewardsAddr).rate;
//     const weeklyRewards = valueToBigDecimal(
//       rewardsRate.times(BigInt.fromI32(604800)),
//       rewardDecimals
//     );

//     // update gauge rewards entity
//     const gaugeReward = getGaugeReward(gauge, rewardsAddr, i);
//     gaugeReward.amount = weeklyRewards;
//     gaugeReward.save();
//   }
// }
