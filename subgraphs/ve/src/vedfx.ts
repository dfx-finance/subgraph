import { Supply as SupplyEvent, veDFX } from "../generated/veDFX/veDFX";
import { VeDFX as veDFXEntity } from "../generated/schema";
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DFX, VEDFX_ADDRESS } from "../../../packages/constants";
import { valueAsBigDecimal } from "./helpers";
import { ERC20 } from "../generated/templates/Gauge/ERC20";

// Create or return veDFX entity to update
function _getVeDfxToken(): veDFXEntity {
  let token = veDFXEntity.load(VEDFX_ADDRESS);
  if (token === null) {
    const veDFXContract = veDFX.bind(Address.fromString(VEDFX_ADDRESS));

    token = new veDFXEntity(VEDFX_ADDRESS);
    token.decimals = veDFXContract.decimals().toI32();
    token.symbol = veDFXContract.symbol();
  }
  return token;
}

/* -- MAIN -- */
/* Event Handlers */
export function handleSupply(event: SupplyEvent): void {
  const veDFXContract = veDFX.bind(Address.fromString(VEDFX_ADDRESS));
  const DFXContract = ERC20.bind(Address.fromString(DFX));

  const token = _getVeDfxToken();
  const decimals = BigInt.fromI32(token.decimals);

  token.supply = valueAsBigDecimal(veDFXContract.supply(), decimals);
  token.dfxBalance = valueAsBigDecimal(
    DFXContract.balanceOf(Address.fromString(VEDFX_ADDRESS)),
    BigInt.fromI32(18)
  );
  token.blockNum = event.block.number;
  token.save();
}
