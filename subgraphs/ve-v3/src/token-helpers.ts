import { Address } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/CurveFactoryV3/ERC20";

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  let contract = ERC20.bind(tokenAddress);

  // try types uint8 for decimals
  let decimalValue = 0;

  let decimalResult = contract.try_decimals();

  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }

  return decimalValue;
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  return contract.symbol();
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  return contract.name();
}
