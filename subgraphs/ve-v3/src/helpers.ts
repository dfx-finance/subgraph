import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DFX_DISTRIBUTOR_PROXY_V3 } from "../../../packages/constants/index";

export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const TWO_BI = BigInt.fromI32(2);
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");
export const WEEK_BI = BigInt.fromI32(60 * 60 * 24 * 7); // in sec

export const DFX_DECIMALS = 18;
export const TOKENLESS_PRODUCTION = 40;
export const EPOCHS_PER_YEAR = 52;

class ConfigAddresses {
  DFX_DISTRIBUTOR: Address;
}

export const Addresses: ConfigAddresses = {
  DFX_DISTRIBUTOR: Address.fromString(DFX_DISTRIBUTOR_PROXY_V3),
};

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (
    let i = BigInt.fromI32(0);
    i.lt(decimals);
    i = i.plus(BigInt.fromI32(1))
  ) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function valueToBigDecimal(value: BigInt, decimals: i32): BigDecimal {
  if (decimals == 0) {
    return value.toBigDecimal();
  }
  const _decimals = BigInt.fromI32(decimals);
  return value.toBigDecimal().div(exponentToBigDecimal(_decimals));
}
