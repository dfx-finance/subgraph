import { BigInt } from "@graphprotocol/graph-ts"

import {
  CurveFactoryV2,
  NewCurve,
  OwnershipTransferred,
  ProtocolFeeUpdated,
  TreasuryUpdated
} from "../generated/CurveFactoryV2/CurveFactoryV2"

import { ZERO_BD } from "./helpers"
import { FACTORY_ADDRESS } from "../../../packages/constants/index"
import { DFXFactoryV2 } from "../generated/schema"


export function handleNewCurve(event: NewCurve): void {
  let factory = DFXFactoryV2.load("0xDE5bb69892D663f1facBE351363509BcB65573AA")
  if (factory === null) {
    factory = new DFXFactoryV2("0xDE5bb69892D663f1facBE351363509BcB65573AA")
    factory.pairCount = 0
  }
  factory.pairCount = factory.pairCount + 1
  factory.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleProtocolFeeUpdated(event: ProtocolFeeUpdated): void {}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {}
