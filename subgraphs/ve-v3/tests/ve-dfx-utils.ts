import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CommitOwnership,
  ApplyOwnership,
  Deposit,
  Withdraw,
  Supply
} from "../generated/veDFX/veDFX"

export function createCommitOwnershipEvent(admin: Address): CommitOwnership {
  let commitOwnershipEvent = changetype<CommitOwnership>(newMockEvent())

  commitOwnershipEvent.parameters = new Array()

  commitOwnershipEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return commitOwnershipEvent
}

export function createApplyOwnershipEvent(admin: Address): ApplyOwnership {
  let applyOwnershipEvent = changetype<ApplyOwnership>(newMockEvent())

  applyOwnershipEvent.parameters = new Array()

  applyOwnershipEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return applyOwnershipEvent
}

export function createDepositEvent(
  provider: Address,
  value: BigInt,
  locktime: BigInt,
  type: BigInt,
  ts: BigInt
): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam(
      "locktime",
      ethereum.Value.fromUnsignedBigInt(locktime)
    )
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("type", ethereum.Value.fromSignedBigInt(type))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("ts", ethereum.Value.fromUnsignedBigInt(ts))
  )

  return depositEvent
}

export function createWithdrawEvent(
  provider: Address,
  value: BigInt,
  ts: BigInt
): Withdraw {
  let withdrawEvent = changetype<Withdraw>(newMockEvent())

  withdrawEvent.parameters = new Array()

  withdrawEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("ts", ethereum.Value.fromUnsignedBigInt(ts))
  )

  return withdrawEvent
}

export function createSupplyEvent(prevSupply: BigInt, supply: BigInt): Supply {
  let supplyEvent = changetype<Supply>(newMockEvent())

  supplyEvent.parameters = new Array()

  supplyEvent.parameters.push(
    new ethereum.EventParam(
      "prevSupply",
      ethereum.Value.fromUnsignedBigInt(prevSupply)
    )
  )
  supplyEvent.parameters.push(
    new ethereum.EventParam("supply", ethereum.Value.fromUnsignedBigInt(supply))
  )

  return supplyEvent
}
