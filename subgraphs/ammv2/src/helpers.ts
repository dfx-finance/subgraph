import { Address, BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { ERC20 } from '../generated/CurveFactoryV2/ERC20'
import { Curve } from "../generated/CurveFactoryV2/Curve";
import { Gauge } from "../generated/templates/Curve/Gauge";
import { Oracle } from "../generated/AssimilatorFactory/Oracle";
import { AssimilatorFactory } from "../generated/CurveFactoryV2/AssimilatorFactory";
import { AssimilatorV2 } from "../generated/CurveFactoryV2/AssimilatorV2";
import { Token } from "../generated/schema";
import { CurveFactoryV2 } from "../generated/CurveFactoryV2/CurveFactoryV2";
import { CADC_GAUGE, CADC_POOL_V2, EUROC_GAUGE, EUROC_POOL_V2, EURS_GAUGE, GYEN_GAUGE, GYEN_POOL_V2, NZDS_GAUGE, NZDS_POOL_V2, TRYB_GAUGE, TRYB_POOL_V2, XIDR_GAUGE, XIDR_POOL_V2, XSGD_GAUGE, XSGD_POOL_V2 } from "../../../packages/constants";

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString("1");
    for (
        let i = BigInt.fromI32(0);
        i.lt(decimals as BigInt);
        i = i.plus(BigInt.fromI32(1))
    ) {
        bd = bd.times(BigDecimal.fromString("10"));
    }
    return bd;
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == BigInt.fromI32(0)) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function fetchLiquidity(curveAddress: Address): BigDecimal {
    let curveContract = Curve.bind(curveAddress)
    let reserveResult = curveContract.try_liquidity()
    let reserveTotal = ZERO_BD
    if (!reserveResult.reverted) {
        reserveTotal = convertTokenToDecimal(reserveResult.value.value0, BigInt.fromString('18'))
    }
    return reserveTotal
}

export function fetchBalanceOf(token: Token, accountAddress: Address): BigDecimal {
    let contract = ERC20.bind(Address.fromString(token.id))
    let rawReserve = contract.balanceOf(accountAddress)
    let reserve = convertTokenToDecimal(rawReserve, token.decimals)
    return reserve
}

export function fetchOracleDecimals(oracleAddress: Address): BigInt {
    let oracle = Oracle.bind(oracleAddress)
    let decimalValue = 0
    let decimalResult = oracle.try_decimals()
    if (!decimalResult.reverted) {
        decimalValue = decimalResult.value
    }
    return BigInt.fromI32(decimalValue as i32)
}

export function fetchAssimilator(assimFactoryAddress: Address, tokenAddress: Address): Address {
    let assimFactory = AssimilatorFactory.bind(assimFactoryAddress)
    return assimFactory.getAssimilator(tokenAddress)
}

export function fetchToken(curveAddress: Address, derivative: BigInt): Address {
    let curve = Curve.bind(curveAddress)
    return curve.derivatives(derivative)
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    // try types uint8 for decimals
    let decimalValue = 0
    let decimalResult = contract.try_decimals()

    if (!decimalResult.reverted) {
      decimalValue = decimalResult.value
    }
    return BigInt.fromI32(decimalValue as i32)
}

export function fetchTokenSymbol(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    return contract.symbol()
}

export function fetchTokenName(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    return contract.name()
}

export function fetchProtocolFee(factoryAddress: Address): BigInt {
    let contract = CurveFactoryV2.bind(factoryAddress)
    return contract.protocolFee()
}

export function fetchProtocolAlpha(curveAddress: Address): BigInt {
    let contract = Curve.bind(curveAddress)
    return contract.curve().value0
}

export function fetchProtocolBeta(curveAddress: Address): BigInt {
    let contract = Curve.bind(curveAddress)
    return contract.curve().value1
}

export function fetchProtocolDelta(curveAddress: Address): BigInt {
    let contract = Curve.bind(curveAddress)
    return contract.curve().value2
}

export function fetchProtocolEpsilon(curveAddress: Address): BigInt {
    let contract = Curve.bind(curveAddress)
    return contract.curve().value3
}

export function fetchProtocolLambda(curveAddress: Address): BigInt {
    let contract = Curve.bind(curveAddress)
    return contract.curve().value4
}

export function fetchStakingContract(tokenAddress: string): string | null {
    // Replaced by dividing the current trades and storing the rates inside hourly pairs / daily.
    if (tokenAddress == XSGD_POOL_V2) {
        return XSGD_GAUGE
    } else if (tokenAddress == CADC_POOL_V2) {
        return CADC_GAUGE
    } else if (tokenAddress == NZDS_POOL_V2){
        return NZDS_GAUGE
    } else if (tokenAddress == TRYB_POOL_V2){
        return TRYB_GAUGE
    } else if (tokenAddress == XIDR_POOL_V2){
        return XIDR_GAUGE
    } else if (tokenAddress == EUROC_POOL_V2) {
        return EUROC_GAUGE
    } else if (tokenAddress == GYEN_POOL_V2) {
        return GYEN_GAUGE
    } else {
        return null
    }
}

// export function fetchPoolParticipantUnstakedLPT(curveAddress: Address, participantAddress: Address): BigDecimal {
    
// }

export function fetchPoolParticipantStakedLPT(curveAddress: Address, participantAddress: Address): BigDecimal {
    let stakingAddress = fetchStakingContract(curveAddress.toHexString())
    let lptInGauge = ZERO_BD
    if (stakingAddress) {
        let contract = Gauge.bind(Address.fromString(stakingAddress))
        let rawLptInGauge = contract.try_balanceOf(participantAddress)
        if (!rawLptInGauge.reverted) {
            lptInGauge = convertTokenToDecimal(rawLptInGauge.value, BigInt.fromString('18'))
        }
    }
    return lptInGauge
}

export function fetchPoolParticipantTotalLPT(curveAddress: Address, participantAddress: Address): BigDecimal {
    let lptInGauge = fetchPoolParticipantStakedLPT(curveAddress, participantAddress)
    return lptInGauge
}

export function fetchTotalLPT(curveAddress: Address): BigDecimal {
    let curveContract = Curve.bind(curveAddress)
    let totalLPTResult = curveContract.try_totalSupply()
    let totalLPT = ZERO_BD
    if (!totalLPTResult.reverted) {
        totalLPT = convertTokenToDecimal(totalLPTResult.value, BigInt.fromString('18'))
    }
    return totalLPT
}