import { Address, BigInt } from "@graphprotocol/graph-ts";
import { NewCurve as NewCurveEvent } from "../generated/CurveFactoryV2/CurveFactoryV2";
import { Curve } from "../generated/CurveFactoryV2/Curve";
import { Pair, Token } from "../generated/schema";
import { Curve as CurveTemplate } from "../generated/templates";
import { ONE_BI, ZERO_BD, ZERO_BI } from "./helpers";

class CurveInfo {
  constructor(
    public decimals: BigInt,
    public name: string,
    public symbol: string
  ) {}
}
function _fetchCurveInfo(curveAddress: Address): CurveInfo {
  const curveContract = Curve.bind(curveAddress);
  const decimals = BigInt.fromI32(curveContract.decimals());
  const name = curveContract.name();
  const symbol = curveContract.symbol();
  return new CurveInfo(decimals, name, symbol);
}

function _fetchToken(curveAddress: Address, derivative: BigInt): Address {
  let curve = Curve.bind(curveAddress);
  return curve.derivatives(derivative);
}

/* -- Main -- */
export function handleNewCurve(event: NewCurveEvent): void {
  let pair = Pair.load(event.params.curve.toHexString());
  if (pair === null) {
    const curveInfo = _fetchCurveInfo(event.params.curve);
    const token0Address = _fetchToken(event.params.curve, ZERO_BI);
    const token0 = Token.load(token0Address.toHexString())!;
    const token1Address = _fetchToken(event.params.curve, ONE_BI);
    const token1 = Token.load(token1Address.toHexString())!;

    pair = new Pair(event.params.curve.toHexString());
    pair.decimals = curveInfo.decimals;
    pair.name = curveInfo.name;
    pair.symbol = curveInfo.symbol;

    pair.token0 = token0.id;
    pair.token1 = token1.id;

    pair.reserve0 = ZERO_BD;
    pair.reserve1 = ZERO_BD;
  }

  pair.save();

  CurveTemplate.create(event.params.curve);
}
