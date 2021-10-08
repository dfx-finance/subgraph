import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { 
    USDC, 
    XSGD,
    CADC,
    EURS,
    NZDS,
    TRYB,
} from "../packages/constants/index"

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
  
export function convertTokenToDecimal(
    tokenAmount: BigInt,
    exchangeDecimals: BigInt
): BigDecimal {
    if (exchangeDecimals == BigInt.fromI32(0)) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function fetchUSDMultiplier(tokenAddress: string): BigDecimal {
    // Replaced by dividing the current trades and storing the rates inside hourly pairs / daily.
    if (tokenAddress == XSGD) {
        return BigDecimal.fromString('0.7252')
    } else if (tokenAddress == CADC) {
        return BigDecimal.fromString('0.7457')
    } else if (tokenAddress == EURS) {
        return BigDecimal.fromString('1.1403')
    } else if (tokenAddress == NZDS){
        return BigDecimal.fromString('0.6494')
    } else if (tokenAddress == TRYB){
        return BigDecimal.fromString('0.1424')
    } else {
        return BigDecimal.fromString('0')
    }
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let address = tokenAddress.toHexString()
    if (address == USDC){
        return BigInt.fromI32(6)
    }else if (address == XSGD) {
        return BigInt.fromI32(6)
    } else if (address == CADC) {
        return BigInt.fromI32(18)
    } else if (address == EURS) {
        return BigInt.fromI32(2)
    } else if (address == NZDS) {
        return BigInt.fromI32(6)
    } else if (address == TRYB) {
        return BigInt.fromI32(6)
    } else {
        return BigInt.fromI32(0)
    }
}
