import { BigInt, Entity } from "@graphprotocol/graph-ts"
import {
  CurveFactoryV2,
  NewCurve as NewCurveEvent,
  OwnershipTransferred as CurveFactoryOwnershipTransferredEvent,
  ProtocolFeeUpdated,
  TreasuryUpdated
} from "../generated/CurveFactoryV2/CurveFactoryV2"

import {
  NewAssimilator as NewAssimilatorEvent,
  AssimilatorRevoked,
  CurveFactoryUpdated,
  OwnershipTransferred as AssimOwnershipTransferredEvent
} from "../generated/AssimilatorFactory/AssimilatorFactory"

import { 
  ZERO_BI, 
  ZERO_BD, 
  ONE_BI,
  ONE_BD,
  fetchToken,
  fetchTokenDecimals,
  fetchTokenSymbol,
  fetchTokenName
} from "./helpers"
import { FACTORY_ADDRESS_V2 } from "../../../packages/constants/index"
import { DFXFactoryV2, NewCurve, Pair, Token, NewAssimilator } from "../generated/schema"
import { Curve, Curve as CurveTemplate} from "../generated/templates"

// CurveFactoryV2
export function handleNewCurve(event: NewCurveEvent): void {
  // Dont need to save this to clutter
  // Might be good to keep track of back actors
  let entity = new NewCurve(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.from = event.params.caller
  entity.curveID = event.params.id
  entity.save()
  
  // existing infra is used to USDC as first token
  let token0Address = fetchToken(event.params.curve, ONE_BI) 
  let token0 = Token.load(token0Address.toHexString())
  if (token0 === null){
    token0 = new Token(token0Address.toHexString())
    let decimals = fetchTokenDecimals(token0Address)
    let symbol = fetchTokenSymbol(token0Address)
    let name = fetchTokenName(token0Address)
    token0.decimals = decimals
    token0.symbol = symbol
    token0.name = name
  }
  token0.save()

  let token1Address = fetchToken(event.params.curve, ZERO_BI) 
  let token1 = Token.load(token1Address.toHexString())
  if (token1 === null){
    token1 = new Token(token1Address.toHexString())
    let decimals = fetchTokenDecimals(token1Address)
    let symbol = fetchTokenSymbol(token1Address)
    let name = fetchTokenName(token1Address)
    token1.decimals = decimals
    token1.symbol = symbol
    token1.name = name
  }
  token1.save()

  let pair = Pair.load(event.params.curve.toHexString())
  if (pair === null) {
    pair = new Pair(event.params.curve.toHexString()) as Pair
    pair.reserve1 = ZERO_BD
    pair.reserve0 = ZERO_BD

    pair.token0 = token0.id
    pair.token1 = token1.id
    // fetch two tokens -> assim -> oracles
  }
  pair.save()


// two oracles here
  let factory = DFXFactoryV2.load(FACTORY_ADDRESS_V2)
  if (factory === null) {
    factory = new DFXFactoryV2(FACTORY_ADDRESS_V2)
    factory.pairCount = 0
    factory.totalVolumeUSD = ZERO_BD
    factory.totalLiquidityUSD = ZERO_BD
  }
  factory.pairCount = factory.pairCount + 1
  factory.save()

  // CurveTemplate.create(event.params.curve);
  // Probably can create new oracles assimilators here as well
}

export function handleCurveFactoryOwnershipTransferred(event: CurveFactoryOwnershipTransferredEvent): void {}

export function handleProtocolFeeUpdated(event: ProtocolFeeUpdated): void {}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {}

// AssimilatorFactory
export function handleNewAssimilator(event: NewAssimilatorEvent): void {
  let entity = new NewAssimilator(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.assimilator = event.params.assimilator
  entity.oracle = event.params.oracle
  entity.token = event.params.token
  entity.save()
}

export function handleAssimilatorRevoked(event: AssimilatorRevoked): void {}

export function handleCurveFactoryUpdated(event: CurveFactoryUpdated): void {}

export function handleAssimOwnershipTransferred(event: AssimOwnershipTransferredEvent): void {}
