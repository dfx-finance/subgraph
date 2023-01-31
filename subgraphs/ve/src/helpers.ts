import { Address } from "@graphprotocol/graph-ts";
import { DFX_DISTRIBUTOR_PROXY } from "../../../packages/constants/index";

class ConfigAddresses {
  DFX_DISTRIBUTOR: Address;
}

export const Addresses: ConfigAddresses = {
  DFX_DISTRIBUTOR: Address.fromString(DFX_DISTRIBUTOR_PROXY),
};
