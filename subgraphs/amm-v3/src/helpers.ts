import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/CurveFactoryV3/ERC20";
import { Curve } from "../generated/CurveFactoryV3/Curve";
import { Oracle } from "../generated/AssimilatorFactory/Oracle";
import { AssimilatorFactory } from "../generated/CurveFactoryV3/AssimilatorFactory";
import { AssimilatorV3 } from "../generated/CurveFactoryV3/AssimilatorV3";
import { Pair, Token } from "../generated/schema";
import { Config } from "../generated/CurveFactoryV3/Config";
import { DFX_TC_ADDRESS, ZAP_ADDRESS_V3, BLACKHOLE_ADDRESS } from "./constants";

import { PoolParticipant } from "../generated/schema";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (
    let i = BigInt.fromI32(0);
    i.lt(decimals as BigInt);
    i = i.plus(BigInt.fromI32(1))
  ) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function convertTokenToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: BigInt
): BigDecimal {
  if (exchangeDecimals == BigInt.fromI32(0)) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function fetchLiquidity(curveAddress: Address): BigDecimal {
  let curveContract = Curve.bind(curveAddress);
  let reserveResult = curveContract.try_liquidity();
  let reserveTotal = ZERO_BD;
  if (!reserveResult.reverted) {
    reserveTotal = convertTokenToDecimal(
      reserveResult.value.value0,
      BigInt.fromString("18")
    );
  }
  return reserveTotal;
}

export function fetchBalanceOf(
  token: Token,
  accountAddress: Address
): BigDecimal {
  let contract = ERC20.bind(Address.fromString(token.id));
  let reserve = BigDecimal.fromString("0");
  let reserveResult = contract.try_balanceOf(accountAddress);
  if (!reserveResult.reverted) {
    reserve = convertTokenToDecimal(reserveResult.value, token.decimals);
  }
  return reserve;
}

export function fetchOracleDecimals(oracleAddress: Address): BigInt {
  let oracle = Oracle.bind(oracleAddress);
  let decimalValue = 0;
  let decimalResult = oracle.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue);
}

export function fetchAssimilator(
  assimFactoryAddress: Address,
  tokenAddress: Address,
  quoteAddress: Address
): Address {
  let assimFactory = AssimilatorFactory.bind(assimFactoryAddress);
  let assim = Address.zero();
  let assimResult = assimFactory.try_getAssimilator(tokenAddress, quoteAddress);
  if (!assimResult.reverted) assim = assimResult.value;
  return assim;
}

export function fetchToken(curveAddress: Address, derivative: BigInt): Address {
  let curve = Curve.bind(curveAddress);
  let derivt = Address.zero();
  let derivtResult = curve.try_derivatives(derivative);
  if (!derivtResult.reverted) derivt = derivtResult.value;
  return derivt;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = 0;
  let decimalResult = contract.try_decimals();

  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue);
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let tokenSymbol = "";
  let tokenSymbolResult = contract.try_symbol();
  if (!tokenSymbolResult.reverted) tokenSymbol = tokenSymbolResult.value;
  return tokenSymbol;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let tokenName = "";
  let tokenNameResult = contract.try_name();
  if (!tokenNameResult.reverted) tokenName = tokenNameResult.value;
  return tokenName;
}

export function fetchProtocolFee(configAddress: Address): BigInt {
  let contract = Config.bind(configAddress);
  let fee = BigInt.fromI32(0);
  let feeResult = contract.try_getProtocolFee();
  if (!feeResult.reverted) fee = feeResult.value;
  return fee;
}

export function fetchProtocolAlpha(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  let alpha = BigInt.fromI32(0);
  let alphaResult = contract.try_viewCurve();
  if (!alphaResult.reverted) alpha = alphaResult.value.value0;
  return alpha;
}

export function fetchProtocolBeta(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  let beta = BigInt.fromI32(0);
  let betaResult = contract.try_viewCurve();
  if (!betaResult.reverted) beta = betaResult.value.value1;
  return beta;
}

export function fetchProtocolDelta(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  let delta = BigInt.fromI32(0);
  let deltaResult = contract.try_viewCurve();
  if (!deltaResult.reverted) delta = deltaResult.value.value2;
  return delta;
}

export function fetchProtocolEpsilon(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  let epsilon = BigInt.fromI32(0);
  let epsionResult = contract.try_viewCurve();
  if (!epsionResult.reverted) epsilon = epsionResult.value.value3;
  return epsilon;
}

export function fetchProtocolLambda(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  let lambda = BigInt.fromI32(0);
  let lambdaResult = contract.try_viewCurve();
  if (!lambdaResult.reverted) lambda = lambdaResult.value.value4;
  return lambda;
}

export function calculateProtocolFee(
  tokenAmountUSD: BigDecimal,
  curveAddress: Address
): BigDecimal {
  let rawFee = fetchProtocolEpsilon(curveAddress);
  let feeDecimal = convertTokenToDecimal(rawFee, BigInt.fromI32(18));
  let feeUSD = feeDecimal.times(tokenAmountUSD).div(BigDecimal.fromString("2"));
  return feeUSD;
}

export function fetchPriceFromAssimilator(
  assimilatorAddress: Address
): BigDecimal {
  let contract = AssimilatorV3.bind(assimilatorAddress);
  let rawPrice = BigInt.fromI32(0);
  let decimal = BigInt.fromI32(0);
  let rawPriceResult = contract.try_getRate();
  if (!rawPriceResult.reverted) rawPrice = rawPriceResult.value;
  let decimalResult = contract.try_oracleDecimals();
  if (!decimalResult.reverted) decimal = decimalResult.value;
  return convertTokenToDecimal(rawPrice, decimal);
}

export function fetchTokenPriceInUSD(oracleAddr: Address): BigDecimal {
  let contract = Oracle.bind(oracleAddr);
  let rawPriceResult = contract.try_latestAnswer();
  let decimalResult = contract.try_decimals();
  if (!rawPriceResult.reverted && !decimalResult.reverted)
    return convertTokenToDecimal(
      rawPriceResult.value,
      BigInt.fromI32(decimalResult.value)
    );
  else return BigDecimal.fromString("0");
}

// export function fetchStakingContract(tokenAddress: string): string | null {
//     // Replaced by dividing the current trades and storing the rates inside hourly pairs / daily.
//     if (tokenAddress == XSGD_POOL_V3) {
//         return XSGD_GAUGE
//     } else if (tokenAddress == CADC_POOL_V3) {
//         return CADC_GAUGE
//     } else if (tokenAddress == NZDS_POOL_V3){
//         return NZDS_GAUGE
//     } else if (tokenAddress == TRYB_POOL_V3){
//         return TRYB_GAUGE
//     } else if (tokenAddress == XIDR_POOL_V3){
//         return XIDR_GAUGE
//     } else if (tokenAddress == EUROC_POOL_V3) {
//         return EUROC_GAUGE
//     } else if (tokenAddress == GYEN_POOL_V3) {
//         return GYEN_GAUGE
//     } else {
//         return null
//     }
// }

export function fetchIsDFXApproved(curveCreatorAddress: Address): boolean {
  if (curveCreatorAddress.toHexString() == DFX_TC_ADDRESS) {
    return true;
  }
  return false;
}

// export function fetchPoolParticipantStakedLPT(curveAddress: Address, participantAddress: Address): BigDecimal {
//     let stakingAddress = fetchStakingContract(curveAddress.toHexString())
//     let lptInGauge = ZERO_BD
//     if (stakingAddress) {
//         let contract = Gauge.bind(Address.fromString(stakingAddress))
//         let rawLptInGauge = contract.try_balanceOf(participantAddress)
//         if (!rawLptInGauge.reverted) {
//             lptInGauge = convertTokenToDecimal(rawLptInGauge.value, BigInt.fromString('18'))
//         }
//     }
//     return lptInGauge
// }

// export function fetchPoolParticipantTotalLPT(curveAddress: Address, participantAddress: Address): BigDecimal {
//     let lptInGauge = fetchPoolParticipantStakedLPT(curveAddress, participantAddress)
//     return lptInGauge
// }

export function fetchTotalLPT(curveAddress: Address): BigDecimal {
  let curveContract = Curve.bind(curveAddress);
  let totalLPTResult = curveContract.try_totalSupply();
  let totalLPT = ZERO_BD;
  if (!totalLPTResult.reverted) {
    totalLPT = convertTokenToDecimal(
      totalLPTResult.value,
      BigInt.fromString("18")
    );
  }
  return totalLPT;
}

export function fetchLPTDeposit(
  curveAddress: Address,
  lptAmount: BigInt
): BigInt[] {
  let curveContract = Curve.bind(curveAddress);
  return curveContract.viewWithdraw(lptAmount);
}

// // TODO: Remove hardcoding after
// export function isGaugeContract(tokenAddress: string): boolean {
//     if (tokenAddress == XSGD_GAUGE) {
//         return true
//     } else if (tokenAddress == CADC_GAUGE) {
//         return true
//     } else if (tokenAddress == NZDS_GAUGE) {
//         return true
//     } else if (tokenAddress == TRYB_GAUGE) {
//         return true
//     } else if (tokenAddress == XIDR_GAUGE){
//         return true
//     } else if (tokenAddress == EUROC_GAUGE){
//         return true
//     } else if (tokenAddress == GYEN_GAUGE){
//         return true
//     } else {
//         return false
//     }
// }

// TODO: Remove hardcoding after
export function getTransferType(
  fromAddress: string,
  toAddress: string
): string {
  if (toAddress == BLACKHOLE_ADDRESS) {
    return "withdraw";
  } else if (
    fromAddress == BLACKHOLE_ADDRESS &&
    toAddress.toLowerCase() != ZAP_ADDRESS_V3.toLowerCase()
  ) {
    return "two-sided-deposit";
  } else if (
    fromAddress == BLACKHOLE_ADDRESS &&
    toAddress.toLowerCase() == ZAP_ADDRESS_V3.toLowerCase()
  ) {
    return "single-sided-deposit";
  }
  // else if (isGaugeContract(toAddress)){
  //     return "stake-from-gauge"
  // } else if (isGaugeContract(fromAddress)){
  //     return "unstake-from-gauge"
  // }
  else if (fromAddress.toLowerCase() == ZAP_ADDRESS_V3.toLowerCase()) {
    return "zap-lp-transfer";
  } else {
    return "lp-transfer";
  }
}

export function handleNewPoolParticipant(
  transferType: string,
  participantAddresss: Address,
  poolAddress: Address
): void {
  let poolParticipant = PoolParticipant.load(
    poolAddress.toHexString() + "-" + participantAddresss.toHexString()
  );
  let pair = Pair.bind(poolAddress);
  if (poolParticipant === null) {
    poolParticipant = new PoolParticipant(
      poolAddress.toHexString() + "-" + participantAddresss.toHexString()
    ) as PoolParticipant;
    poolParticipant.pair = pair.id;
    poolParticipant.participant = participantAddresss;
    poolParticipant.liquidityProvided = ZERO_BD;
    // dedeuce the pair count
    if (transferType == "withdraw") {
      // NOT always minus one here cause we would have to check first
      // Check balance first
      let balance = fetchBalanceOf(
        Token.bind(poolAddress),
        participantAddresss
      );
      if (balance <= ZERO_BD) {
        pair.participantCount.minus(ONE_BI);
      }
    } else if (
      transferType == "two-sided-deposit" ||
      transferType == "single-sided-deposit"
    ) {
      // always add one here cause we know its new
    } else if (transferType == "lp-transfer") {
      // add one only if the amount is not larger already have to check first
    }
  }
}
