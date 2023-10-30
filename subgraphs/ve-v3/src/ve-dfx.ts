import { Address } from "@graphprotocol/graph-ts";
import { veDFX as veDFXEntity } from "../generated/schema";
import {
  veDFX as VeDFXContract,
  Supply as SupplyEvent,
} from "../generated/veDFX/veDFX";
import { ERC20 as ERC20Contract } from "../generated/veDFX/ERC20";
import { DFX, VEDFX_ADDRESS } from "../../../packages/constants";
import { valueToBigDecimal } from "./helpers";

// Create or return veDFX entity to update
function _getVeDfxToken(): veDFXEntity {
  let token = veDFXEntity.load(VEDFX_ADDRESS);
  if (token === null) {
    const veDFXContract = VeDFXContract.bind(Address.fromString(VEDFX_ADDRESS));

    token = new veDFXEntity(VEDFX_ADDRESS);
    token.decimals = veDFXContract.decimals().toI32();
    token.symbol = veDFXContract.symbol();
  }
  return token;
}

/* -- MAIN -- */
/* Event Handlers */
export function handleSupply(event: SupplyEvent): void {
  const veDFXContract = VeDFXContract.bind(Address.fromString(VEDFX_ADDRESS));
  const DFXContract = ERC20Contract.bind(Address.fromString(DFX));

  const token = _getVeDfxToken();

  token.supply = valueToBigDecimal(veDFXContract.supply(), token.decimals);
  token.dfxBalance = valueToBigDecimal(
    DFXContract.balanceOf(Address.fromString(VEDFX_ADDRESS)),
    18
  );
  token.blockNum = event.block.number;
  token.save();
}
