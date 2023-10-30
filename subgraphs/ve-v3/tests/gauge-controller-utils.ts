import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CommitOwnership,
  ApplyOwnership,
  AddType,
  NewTypeWeight,
  NewGaugeWeight,
  VoteForGauge,
  NewGauge,
  KilledGauge
} from "../generated/GaugeController/GaugeController"

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

export function createAddTypeEvent(name: string, type_id: BigInt): AddType {
  let addTypeEvent = changetype<AddType>(newMockEvent())

  addTypeEvent.parameters = new Array()

  addTypeEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  addTypeEvent.parameters.push(
    new ethereum.EventParam("type_id", ethereum.Value.fromSignedBigInt(type_id))
  )

  return addTypeEvent
}

export function createNewTypeWeightEvent(
  type_id: BigInt,
  time: BigInt,
  weight: BigInt,
  total_weight: BigInt
): NewTypeWeight {
  let newTypeWeightEvent = changetype<NewTypeWeight>(newMockEvent())

  newTypeWeightEvent.parameters = new Array()

  newTypeWeightEvent.parameters.push(
    new ethereum.EventParam("type_id", ethereum.Value.fromSignedBigInt(type_id))
  )
  newTypeWeightEvent.parameters.push(
    new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(time))
  )
  newTypeWeightEvent.parameters.push(
    new ethereum.EventParam("weight", ethereum.Value.fromUnsignedBigInt(weight))
  )
  newTypeWeightEvent.parameters.push(
    new ethereum.EventParam(
      "total_weight",
      ethereum.Value.fromUnsignedBigInt(total_weight)
    )
  )

  return newTypeWeightEvent
}

export function createNewGaugeWeightEvent(
  gauge_address: Address,
  time: BigInt,
  weight: BigInt,
  total_weight: BigInt
): NewGaugeWeight {
  let newGaugeWeightEvent = changetype<NewGaugeWeight>(newMockEvent())

  newGaugeWeightEvent.parameters = new Array()

  newGaugeWeightEvent.parameters.push(
    new ethereum.EventParam(
      "gauge_address",
      ethereum.Value.fromAddress(gauge_address)
    )
  )
  newGaugeWeightEvent.parameters.push(
    new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(time))
  )
  newGaugeWeightEvent.parameters.push(
    new ethereum.EventParam("weight", ethereum.Value.fromUnsignedBigInt(weight))
  )
  newGaugeWeightEvent.parameters.push(
    new ethereum.EventParam(
      "total_weight",
      ethereum.Value.fromUnsignedBigInt(total_weight)
    )
  )

  return newGaugeWeightEvent
}

export function createVoteForGaugeEvent(
  time: BigInt,
  user: Address,
  gauge_addr: Address,
  weight: BigInt
): VoteForGauge {
  let voteForGaugeEvent = changetype<VoteForGauge>(newMockEvent())

  voteForGaugeEvent.parameters = new Array()

  voteForGaugeEvent.parameters.push(
    new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(time))
  )
  voteForGaugeEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  voteForGaugeEvent.parameters.push(
    new ethereum.EventParam(
      "gauge_addr",
      ethereum.Value.fromAddress(gauge_addr)
    )
  )
  voteForGaugeEvent.parameters.push(
    new ethereum.EventParam("weight", ethereum.Value.fromUnsignedBigInt(weight))
  )

  return voteForGaugeEvent
}

export function createNewGaugeEvent(
  addr: Address,
  gauge_type: BigInt,
  weight: BigInt
): NewGauge {
  let newGaugeEvent = changetype<NewGauge>(newMockEvent())

  newGaugeEvent.parameters = new Array()

  newGaugeEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )
  newGaugeEvent.parameters.push(
    new ethereum.EventParam(
      "gauge_type",
      ethereum.Value.fromSignedBigInt(gauge_type)
    )
  )
  newGaugeEvent.parameters.push(
    new ethereum.EventParam("weight", ethereum.Value.fromUnsignedBigInt(weight))
  )

  return newGaugeEvent
}

export function createKilledGaugeEvent(addr: Address): KilledGauge {
  let killedGaugeEvent = changetype<KilledGauge>(newMockEvent())

  killedGaugeEvent.parameters = new Array()

  killedGaugeEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )

  return killedGaugeEvent
}
