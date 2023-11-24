import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { NewCurve as NewCurveEvent } from "../generated/CurveFactoryV3/CurveFactoryV3";
import { CurveV3 } from "../generated/CurveFactoryV3/CurveV3";
import { Pair } from "../generated/schema";
import { Curve as CurveTemplate } from "../generated/templates";
import { ONE_BI, ZERO_BD, ZERO_BI, valueToBigDecimal } from "./helpers";

class CurveInfo {
  constructor(
    public decimals: i32,
    public name: string,
    public symbol: string,
    public totalSupply: BigDecimal,
    public token0: Address,
    public token1: Address
  ) {}
}
export function fetchCurveInfo(curveAddress: Address): CurveInfo {
  const curveContract = CurveV3.bind(curveAddress);
  const decimals = curveContract.decimals();
  const name = curveContract.name();
  const symbol = curveContract.symbol();
  const totalSupply = valueToBigDecimal(curveContract.totalSupply(), 18);

  const token0 = curveContract.derivatives(ZERO_BI);
  const token1 = curveContract.derivatives(ONE_BI);

  return new CurveInfo(decimals, name, symbol, totalSupply, token0, token1);
}

/* -- Main -- */
export function handleNewCurve(event: NewCurveEvent): void {
  let pair = Pair.load(event.params.curve.toHexString());
  if (pair === null) {
    const curveInfo = fetchCurveInfo(event.params.curve);
    pair = new Pair(event.params.curve.toHexString());
    pair.decimals = curveInfo.decimals;
    pair.name = curveInfo.name;
    pair.symbol = curveInfo.symbol;
    pair.supply = curveInfo.totalSupply;
    pair.token0 = curveInfo.token0.toHexString();
    pair.token1 = curveInfo.token1.toHexString();
    pair.reserve0 = ZERO_BD;
    pair.reserve1 = ZERO_BD;
    pair.reserveUSD = ZERO_BD;
  }
  pair.save();
  CurveTemplate.create(event.params.curve);
}
