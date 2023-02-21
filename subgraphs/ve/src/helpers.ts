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
