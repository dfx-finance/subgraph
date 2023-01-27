import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Supply as SupplyEvent,
} from "../generated/veDFX/veDFX";
import { Deposit, Withdraw, Supply } from "../generated/schema";
import { BigDecimal } from "@graphprotocol/graph-ts";

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.address = event.params.provider;
  entity.value = event.params.value;
  entity.locktime = event.params.locktime;
  switch (event.params.type.toU32()) {
    case 0:
      entity.type = "deposit";
      break;
    case 1:
      entity.type = "lock";
      break;
    case 2:
      entity.type = "increaseAmount";
      break;
    case 3:
      entity.type = "increaseDuration";
      break;
  }

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
