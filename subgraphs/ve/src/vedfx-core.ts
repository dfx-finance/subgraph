import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Supply as SupplyEvent,
} from "../generated/veDFX/veDFX";
import { Lock, Withdraw, Supply } from "../generated/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

function lockType(_type: BigInt) {
  switch (_type.toU32()) {
    case 0:
      return "deposit";
    case 1:
      return "lock";
    case 2:
      return "increaseAmount";
    case 3:
      return "increaseDuration";
  }
  return "unknown-type";
}

export function handleLock(event: DepositEvent): void {
  let entity = new Lock(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.address = event.params.provider;
  entity.value = event.params.value;
  entity.locktime = event.params.locktime;
  entity.type = lockType(event.params.type);

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let entity = new Withdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.address = event.params.provider;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleSupply(event: SupplyEvent): void {
  let entity = new Supply(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.prevSupply = event.params.prevSupply
    .toBigDecimal()
    .div(BigDecimal.fromString("1e18"));
  entity.supply = event.params.supply
    .toBigDecimal()
    .div(BigDecimal.fromString("1e18"));

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
