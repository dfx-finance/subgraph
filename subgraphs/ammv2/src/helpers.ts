import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { ERC20 } from '../generated/CurveFactoryV2/ERC20'

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
