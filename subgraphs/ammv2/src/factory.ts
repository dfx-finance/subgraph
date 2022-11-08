import { Address, BigInt, Entity } from "@graphprotocol/graph-ts"
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
  USDC
} from "../../../packages/constants/index"

import { 
  ZERO_BI, 
  ZERO_BD, 
  ONE_BI,
  ONE_BD,
  fetchToken,
  fetchTokenDecimals,
  fetchTokenSymbol,
  fetchTokenName,
  fetchOracleDecimals,
  fetchAssimilator,
  fetchProtocolAlpha,
  fetchProtocolBeta,
  fetchProtocolDelta,
  fetchProtocolEpsilon,
  fetchProtocolLambda,
  fetchProtocolFee,
} from "./helpers"
import { FACTORY_ADDRESS_V2, ASSIM_FACTORY_ADDRESS_V2 } from "../../../packages/constants/index"
import { DFXFactoryV2, Pair, Token, Oracle, Assimilator} from "../generated/schema"
import { Curve, Curve as CurveTemplate} from "../generated/templates"

// CurveFactoryV2
export function handleNewCurve(event: NewCurveEvent): void {
  // Dont need to save this to clutter
  // Might be good to keep track of back actors
  // TODO make a new track for bad actors that are coming in
  
  // existing infra is used to USDC as first token
  let token0Address = fetchToken(event.params.curve, ZERO_BI) 
  let token0 = Token.load(token0Address.toHexString())!

  let token1Address = fetchToken(event.params.curve, ONE_BI) 
  let token1 = Token.load(token1Address.toHexString())!

  let assim0Address = fetchAssimilator(Address.fromString(ASSIM_FACTORY_ADDRESS_V2), token0Address)
  let assim1Address = fetchAssimilator(Address.fromString(ASSIM_FACTORY_ADDRESS_V2), token1Address)
  let assimilator0 = Assimilator.load(assim0Address.toHexString())!
  let assimilator1 = Assimilator.load(assim1Address.toHexString())!

  let pair = Pair.load(event.params.curve.toHexString())
  if (pair === null) {
    pair = new Pair(event.params.curve.toHexString()) as Pair
    let decimals = fetchTokenDecimals(event.params.curve)
    let symbol = fetchTokenSymbol(event.params.curve)
    let name = fetchTokenName(event.params.curve)
    pair.decimals = decimals
    pair.symbol = symbol
    pair.name = name

    pair.alpha = fetchProtocolAlpha(event.params.curve)
    pair.beta = fetchProtocolBeta(event.params.curve)
    pair.delta = fetchProtocolDelta(event.params.curve)
    pair.epsilon = fetchProtocolEpsilon(event.params.curve)
    pair.lambda = fetchProtocolLambda(event.params.curve)

    pair.protocolFee = fetchProtocolFee(event.address)

    pair.reserve0 = ZERO_BD
    pair.reserve1 = ZERO_BD
    pair.reserveUSD = ZERO_BD
    pair.reserveNative = ZERO_BD

    pair.swapRateUSD = ZERO_BD
    pair.swapRateNative = ZERO_BD
    //     pair.rewardDuration = ZERO_BI
    //     pair.rewardsForDuration = ZERO_BD
    pair.volumeToken0 = ZERO_BD
    pair.volumeToken1 = ZERO_BD
    pair.volumeUSD = ZERO_BD
    pair.txnsCount = ZERO_BI
    pair.totalLPToken = ZERO_BD
    pair.participantCount = ZERO_BI
    pair.assimilator0 = assimilator0.id
    pair.assimilator1 = assimilator1.id

    pair.token0 = token0.id
    pair.token1 = token1.id
  }

  let factory = DFXFactoryV2.load(FACTORY_ADDRESS_V2)
  if (factory === null) {
    factory = new DFXFactoryV2(FACTORY_ADDRESS_V2)
    factory.pairCount = 0
    factory.totalVolumeUSD = ZERO_BD
    factory.totalLiquidityUSD = ZERO_BD
  }
  factory.pairCount = factory.pairCount + 1
  
  pair.save()
  factory.save()
  CurveTemplate.create(event.params.curve);
}

export function handleCurveFactoryOwnershipTransferred(event: CurveFactoryOwnershipTransferredEvent): void {}

export function handleProtocolFeeUpdated(event: ProtocolFeeUpdated): void {}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {}

// AssimilatorFactory
export function handleNewAssimilator(event: NewAssimilatorEvent): void {
  // TODO: Delete this because it is unessesary
  // let entity = new NewAssimilator(
  //   event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  // )
  // entity.assimilator = event.params.assimilator
  // entity.oracle = event.params.oracle
  // entity.token = event.params.token

  let oracle = Oracle.load(event.params.oracle.toHexString())
  if (oracle === null) {
    oracle = new Oracle(event.params.oracle.toHexString())
    let decimals = fetchOracleDecimals(event.params.oracle)
    oracle.decimals = decimals
  }
  
  let assimilator = Assimilator.load(event.params.assimilator.toHexString())
  if (assimilator === null) {
    assimilator = new Assimilator(event.params.assimilator.toHexString())
    assimilator.oracle = oracle.id
  }

  let token = Token.load(event.params.token.toHexString())
  if (token === null) {
    token = new Token(event.params.token.toHexString())
    let decimals = fetchTokenDecimals(event.params.token)
    let symbol = fetchTokenSymbol(event.params.token)
    let name = fetchTokenName(event.params.token)
    token.decimals = decimals
    token.symbol = symbol
    token.name = name
    if (token.id == USDC) {
      token.priceUSD = ONE_BD
    } else {
      token.priceUSD = ZERO_BD
    }
  }

  oracle.save()
  assimilator.save()
  token.save()
}

export function handleAssimilatorRevoked(event: AssimilatorRevoked): void {}

export function handleCurveFactoryUpdated(event: CurveFactoryUpdated): void {}

export function handleAssimOwnershipTransferred(event: AssimOwnershipTransferredEvent): void {}
