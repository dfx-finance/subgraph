import { Address, BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { ERC20 } from '../generated/CurveFactoryV2/ERC20'
import { Curve } from "../generated/CurveFactoryV2/Curve";
import { Oracle } from "../generated/AssimilatorFactory/Oracle";
import { AssimilatorFactory } from "../generated/CurveFactoryV2/AssimilatorFactory";
import { AssimilatorV2 } from "../generated/CurveFactoryV2/AssimilatorV2";

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')

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
  
export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == BigInt.fromI32(0)) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function fetchOracleDecimals(oracleAddress: Address): BigInt {
    let oracle = Oracle.bind(oracleAddress)
    let decimalValue = 0
    let decimalResult = oracle.try_decimals()
    if (!decimalResult.reverted) {
        decimalValue = decimalResult.value
    }
    return BigInt.fromI32(decimalValue as i32)
}

// export function fetchAssimilator(assimFactoryAddress: Address, curveAddress: Address): Address {
//     // get assimilator factory
//     let assimFactory = AssimilatorFactory.bind(assimFactoryAddress)
//     return assimFactory.getAssimilator(curveAddress)
// }

export function fetchToken(curveAddress: Address, derivative: BigInt): Address {
    let curve = Curve.bind(curveAddress)
    return curve.derivatives(derivative)
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    // try types uint8 for decimals
    let decimalValue = 0
    let decimalResult = contract.try_decimals()

    if (!decimalResult.reverted) {
      decimalValue = decimalResult.value
    }
    return BigInt.fromI32(decimalValue as i32)
}

export function fetchTokenSymbol(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    return contract.symbol()
}

export function fetchTokenName(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    return contract.name()
}
