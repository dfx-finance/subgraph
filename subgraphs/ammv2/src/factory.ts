import { BigInt } from "@graphprotocol/graph-ts"
import {
  CurveFactoryV2,
  NewCurve,
  OwnershipTransferred,
  ProtocolFeeUpdated,
  TreasuryUpdated
} from "../generated/CurveFactoryV2/CurveFactoryV2"

import { ZERO_BD } from "./helpers"
import { FACTORY_ADDRESS_V2 } from "../../../packages/constants/index"
import { DFXFactoryV2 } from "../generated/schema"
import { Curve as CurveTemplate} from "../generated/templates"

export function handleNewCurve(event: NewCurve): void {
  let factory = DFXFactoryV2.load(FACTORY_ADDRESS_V2)
  if (factory === null) {
    factory = new DFXFactoryV2(FACTORY_ADDRESS_V2)
    factory.pairCount = 0
    factory.totalVolumeUSD = ZERO_BD
    factory.totalLiquidityUSD = ZERO_BD
  }
  factory.pairCount = factory.pairCount + 1
  factory.save()

  CurveTemplate.create(event.params.curve);
  // Probably can create new oracles assimilators here as well
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleProtocolFeeUpdated(event: ProtocolFeeUpdated): void {}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {}
