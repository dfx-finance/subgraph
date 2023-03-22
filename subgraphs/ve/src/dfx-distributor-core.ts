import {
  RateUpdated as RateUpdatedEvent,
  Recovered as RecoveredEvent,
  RewardDistributed as RewardDistributedEvent,
  UpdateMiningParameters as UpdateMiningParametersEvent,
} from "../generated/dfxDistributor/dfxDistributor";
import { Rate, Recovered, RewardDistributed } from "../generated/schema";

export function handleRateUpdated(event: RateUpdatedEvent): void {
  let entity = new Rate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.rate = event.params._newRate;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRecovered(event: RecoveredEvent): void {
  let entity = new Recovered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokenAddress = event.params.tokenAddress;
  entity.to = event.params.to;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRewardDistributed(event: RewardDistributedEvent): void {
  let entity = new RewardDistributed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.gaugeAddr = event.params.gaugeAddr;
  entity.rewardTally = event.params.rewardTally;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
