import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { 
    CRV_CADC_DFXCAD_STAKING
} from "../../../packages/constants/index"

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let EIGHTEEN_BD = BigDecimal.fromString('18')

export function isStakingContract(tokenAddress: string): boolean {
    if (tokenAddress == CRV_CADC_DFXCAD_STAKING) {
        return true
    } else {
        return false
    }
}

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
