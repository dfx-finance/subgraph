import { log, Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/Factory/ERC20";

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')

export const FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

// Tokens
export let USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export let XSGD = '0x70e8de73ce538da2beed35d14187f6959a8eca96'
export let CADC = '0xcadc0acd4b445166f12d2c07eac6e2544fbe2eef'
export let EURS = '0xdb25f211ab05b1c97d595516f45794528a807ad8'

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
    if (tokenAddress == XSGD) {
        return BigDecimal.fromString('0.7252')
    } else if (tokenAddress == CADC) {
        return BigDecimal.fromString('0.7457')
    } else if (tokenAddress == EURS) {
        return BigDecimal.fromString('1.1403')
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
    } else {
        return BigInt.fromI32(0)
    }
}
