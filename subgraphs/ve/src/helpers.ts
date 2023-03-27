import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DFX_DISTRIBUTOR_PROXY } from "../../../packages/constants/index";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");

class ConfigAddresses {
  DFX_DISTRIBUTOR: Address;
}

export const Addresses: ConfigAddresses = {
  DFX_DISTRIBUTOR: Address.fromString(DFX_DISTRIBUTOR_PROXY),
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

export function valueAsBigDecimal(value: BigInt, decimals: BigInt): BigDecimal {
  return value.toBigDecimal().div(exponentToBigDecimal(decimals));
}
