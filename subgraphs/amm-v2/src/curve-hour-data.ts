import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/CurveFactoryV2/ERC20";
import { Curve } from "../generated/CurveFactoryV2/Curve";
import { Gauge } from "../generated/templates/Curve/Gauge";
import { Oracle } from "../generated/AssimilatorFactory/Oracle";
import { AssimilatorFactory } from "../generated/CurveFactoryV2/AssimilatorFactory";
import { AssimilatorV2 } from "../generated/CurveFactoryV2/AssimilatorV2";
import { Pair, Token } from "../generated/schema";
import { CurveFactoryV2 } from "../generated/CurveFactoryV2/CurveFactoryV2";
import {
  DFX_HARRY_DEV_ADDRESS,
  ZAP_ADDRESS_V2,
  BLACKHOLE_ADDRESS,
  CADC_GAUGE,
  CADC_POOL_V2,
  EUROC_GAUGE,
  EUROC_POOL_V2,
  GYEN_GAUGE,
  GYEN_POOL_V2,
  NZDS_GAUGE,
  NZDS_POOL_V2,
  TRYB_GAUGE,
  TRYB_POOL_V2,
  XIDR_GAUGE,
  XIDR_POOL_V2,
  XSGD_GAUGE,
  XSGD_POOL_V2,
} from "../../../packages/constants";

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
  let rawReserve = contract.balanceOf(accountAddress);
  let reserve = convertTokenToDecimal(rawReserve, token.decimals);
  return reserve;
}

export function fetchOracleDecimals(oracleAddress: Address): BigInt {
  let oracle = Oracle.bind(oracleAddress);
  let decimalValue = 0;
  let decimalResult = oracle.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue as i32);
}

export function fetchAssimilator(
  assimFactoryAddress: Address,
  tokenAddress: Address
): Address {
  let assimFactory = AssimilatorFactory.bind(assimFactoryAddress);
  return assimFactory.getAssimilator(tokenAddress);
}

export function fetchToken(curveAddress: Address, derivative: BigInt): Address {
  let curve = Curve.bind(curveAddress);
  return curve.derivatives(derivative);
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = 0;
  let decimalResult = contract.try_decimals();

  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue as i32);
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  return contract.symbol();
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  return contract.name();
}

export function fetchProtocolFee(factoryAddress: Address): BigInt {
  let contract = CurveFactoryV2.bind(factoryAddress);
  return contract.protocolFee();
}

export function fetchProtocolAlpha(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  return contract.viewCurve().value0;
}

export function fetchProtocolBeta(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  return contract.viewCurve().value1;
}

export function fetchProtocolDelta(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  return contract.viewCurve().value2;
}

export function fetchProtocolEpsilon(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  return contract.viewCurve().value3;
}

export function fetchProtocolLambda(curveAddress: Address): BigInt {
  let contract = Curve.bind(curveAddress);
  return contract.viewCurve().value4;
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
  let contract = AssimilatorV2.bind(assimilatorAddress);
  let rawPrice = contract.getRate();
  let decimal = contract.oracleDecimals();
  return convertTokenToDecimal(rawPrice, decimal);
}

export function fetchStakingContract(tokenAddress: string): string | null {
  // Replaced by dividing the current trades and storing the rates inside hourly pairs / daily.
  if (tokenAddress == XSGD_POOL_V2) {
    return XSGD_GAUGE;
  } else if (tokenAddress == CADC_POOL_V2) {
    return CADC_GAUGE;
  } else if (tokenAddress == NZDS_POOL_V2) {
    return NZDS_GAUGE;
  } else if (tokenAddress == TRYB_POOL_V2) {
    return TRYB_GAUGE;
  } else if (tokenAddress == XIDR_POOL_V2) {
    return XIDR_GAUGE;
  } else if (tokenAddress == EUROC_POOL_V2) {
    return EUROC_GAUGE;
  } else if (tokenAddress == GYEN_POOL_V2) {
    return GYEN_GAUGE;
  } else {
    return null;
  }
}

export function fetchIsDFXApproved(curveCreatorAddress: Address): boolean {
  if (curveCreatorAddress.toHexString() == DFX_HARRY_DEV_ADDRESS) {
    return true;
  }
  return false;
}

export function fetchPoolParticipantStakedLPT(
  curveAddress: Address,
  participantAddress: Address
): BigDecimal {
  let stakingAddress = fetchStakingContract(curveAddress.toHexString());
  let lptInGauge = ZERO_BD;
  if (stakingAddress) {
    let contract = Gauge.bind(Address.fromString(stakingAddress));
    let rawLptInGauge = contract.try_balanceOf(participantAddress);
    if (!rawLptInGauge.reverted) {
      lptInGauge = convertTokenToDecimal(
        rawLptInGauge.value,
        BigInt.fromString("18")
      );
    }
  }
  return lptInGauge;
}

export function fetchPoolParticipantTotalLPT(
  curveAddress: Address,
  participantAddress: Address
): BigDecimal {
  let lptInGauge = fetchPoolParticipantStakedLPT(
    curveAddress,
    participantAddress
  );
  return lptInGauge;
}

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

// TODO: Remove hardcoding after
export function isGaugeContract(tokenAddress: string): boolean {
  if (tokenAddress == XSGD_GAUGE) {
    return true;
  } else if (tokenAddress == CADC_GAUGE) {
    return true;
  } else if (tokenAddress == NZDS_GAUGE) {
    return true;
  } else if (tokenAddress == TRYB_GAUGE) {
    return true;
  } else if (tokenAddress == XIDR_GAUGE) {
    return true;
  } else if (tokenAddress == EUROC_GAUGE) {
    return true;
  } else if (tokenAddress == GYEN_GAUGE) {
    return true;
  } else {
    return false;
  }
}

// TODO: Remove hardcoding after
export function getTransferType(
  fromAddress: string,
  toAddress: string
): string {
  if (toAddress == BLACKHOLE_ADDRESS) {
    return "withdraw";
  } else if (fromAddress == BLACKHOLE_ADDRESS && toAddress != ZAP_ADDRESS_V2) {
    return "two-sided-deposit";
  } else if (fromAddress == BLACKHOLE_ADDRESS && toAddress == ZAP_ADDRESS_V2) {
    return "single-sided-deposit";
  } else if (isGaugeContract(toAddress)) {
    return "stake-from-gauge";
  } else if (isGaugeContract(fromAddress)) {
    return "unstake-from-gauge";
  } else if (fromAddress == ZAP_ADDRESS_V2) {
    return "zap-lp-transfer";
  } else {
    return "lp-transfer";
  }
}

// export function handleNewPoolParticipant(
//         transferType: string,
//         participantAddresss: Address,
//         poolAddress: Address,
//     ) {

//     let poolParticipant = PoolParticipant.load(poolAddress.toHexString() + "-" + participantAddresss.toHexString())
//     if (poolParticipant === null) {
//         poolParticipant = new PoolParticipant(poolAddress.toHexString() + "-" + participantAddresss.toHexString()) as PoolParticipant
//         poolParticipant.pair = pair.id
//         poolParticipant.participant = participantAddresss
//         poolParticipant.liquidityProvided = ZERO_BD
//         // dedeuce the pair count
//         if (transferType == "withdraw") {
//             // NOT always minus one here cause we would have to check first
//             // Check balance first
//             let balance = fetchBalanceOf(poolAddress, participantAddresss)
//             if (balance <= ZERO_BD) {
//                 pair.participantCount.minus(ONE_BI)
//             }
//         } else if (transferType == "two-sided-deposit" || transferType == "single-sided-deposit") {
//             // always add one here cause we know its new
//         } else if (transferType == "lp-transfer") {
//             // add one only if the amount is not larger already have to check first
//         }
//     }
// }
