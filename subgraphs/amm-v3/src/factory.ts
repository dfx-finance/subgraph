import { Address, BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  CurveFactoryV2,
  NewCurve as NewCurveEvent
} from "../generated/CurveFactoryV2/CurveFactoryV2"
import {
  NewAssimilator as NewAssimilatorEvent,
  AssimilatorRevoked
} from "../generated/AssimilatorFactory/AssimilatorFactory"

import {Assimilator, Oracle, Token, DFXFactoryV2, Pair} from "../generated/schema";
import {Curve as CurveTemplate} from "../generated/templates"

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
  fetchIsDFXApproved,
  fetchPriceFromAssimilator,
  fetchTokenPriceInUSD
} from "./helpers"
import {
  FACTORY_ADDRESS_V25,
  ASSIM_FACTORY_ADDRESS_V25
} from "./constants"

export function handleNewCurve(event: NewCurveEvent): void {
  // create a new Curve template to listen to events
  CurveTemplate.create(event.params.curve)
  // Dont need to save this to clutter
  // Might be good to keep track of back actors
  // TODO make a new track for bad actors that are coming in
  
  let token0Address = fetchToken(event.params.curve, ZERO_BI) 
  let token0 = Token.load(token0Address.toHexString())!

  let token1Address = fetchToken(event.params.curve, ONE_BI) 
  let token1 = Token.load(token1Address.toHexString())!


  let assim0Address = fetchAssimilator(Address.fromString(ASSIM_FACTORY_ADDRESS_V25), token0Address, token1Address)
  let assim1Address = fetchAssimilator(Address.fromString(ASSIM_FACTORY_ADDRESS_V25), token1Address, token0Address)
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

    // pair.protocolFee = fetchProtocolFee(event.address)
    pair.protocolFee = ZERO_BI

    pair.reserve0 = ZERO_BD
    pair.reserve1 = ZERO_BD
    pair.reserve0USD = ZERO_BD
    pair.reserve1USD = ZERO_BD

    pair.reserveUSD = ZERO_BD
    pair.reserveNative = ZERO_BD

    pair.swapRateFrom0To1 = ZERO_BD
    pair.swapRateFrom0To1USD = ZERO_BD
    pair.swapRateFrom1To0 = ZERO_BD
    pair.swapRateFrom1To0USD = ZERO_BD

    pair.volumeToken0USD = ZERO_BD
    pair.volumeToken1USD = ZERO_BD
    pair.volumeToken0 = ZERO_BD
    pair.volumeToken1 = ZERO_BD
    pair.totalFeeUSD = ZERO_BD
    pair.txnsCount = ZERO_BI

    pair.totalLPToken = ZERO_BD
    pair.participantCount = ZERO_BI

    pair.assimilatorFrom0To1 = assimilator0.id
    pair.assimilatorFrom1To0 = assimilator1.id

    pair.token0 = token0.id
    pair.token1 = token1.id

    pair.dfxApproved = fetchIsDFXApproved(event.transaction.from)
  }

  let factory = DFXFactoryV2.load(FACTORY_ADDRESS_V25)
  if (factory === null) {
    factory = new DFXFactoryV2(FACTORY_ADDRESS_V25)
    factory.pairCount = 0
    factory.totalVolumeUSD = ZERO_BD
    factory.totalLiquidityUSD = ZERO_BD
    factory.totalFeeUSD = ZERO_BD
  }
  factory.pairCount = factory.pairCount + 1
  
  pair.save()
  factory.save()
}

export function handleNewAssimilator(event: NewAssimilatorEvent): void {
    let oracle = Oracle.load(event.params.oracle.toHexString())
    if (oracle === null) {
      oracle = new Oracle(event.params.oracle.toHexString())
      let decimals = fetchOracleDecimals(event.params.oracle)
      oracle.decimals = decimals
      oracle.token = event.params.token
    }
    
    let assimilator = Assimilator.load(event.params.assimilator.toHexString())
    if (assimilator === null) {
      assimilator = new Assimilator(event.params.assimilator.toHexString())
      assimilator.oracle = oracle.id
      assimilator.token = event.params.token
      assimilator.pairToken = event.params.quote
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
    token.priceUSD = fetchTokenPriceInUSD(event.params.oracle)
    token.oracle = oracle.id
  }
    oracle.save()
    assimilator.save()
    token.save()
}

export function handleAssimilatorRevoked(event: AssimilatorRevoked): void {}