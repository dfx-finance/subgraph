import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DFX_DISTRIBUTOR_PROXY } from "../../../packages/constants/index";
import { Curve } from "../generated/templates/Curve/Curve";

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

export function valueToBigDecimal(value: BigInt, decimals: i32): BigDecimal {
  if (decimals == 0) {
    return value.toBigDecimal();
  }
  const _decimals = BigInt.fromI32(decimals);
  return value.toBigDecimal().div(exponentToBigDecimal(_decimals));
}

export function fetchPairLiquidity(curveAddress: Address): BigDecimal {
  let curveContract = Curve.bind(curveAddress);
  let reserveResult = curveContract.try_liquidity();
  let reserveTotal = ZERO_BD;
  if (!reserveResult.reverted) {
    reserveTotal = valueToBigDecimal(reserveResult.value.value0, 18);
  }
  return reserveTotal;
}
