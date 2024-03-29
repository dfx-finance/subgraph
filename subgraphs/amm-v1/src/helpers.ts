import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { ERC20 } from '../generated/Factory/ERC20'
import { Staking } from '../generated/templates/Curve/Staking'
import { 
    XSGD_POOL_V1, CADC_POOL_V1, EURS_POOL_V1, NZDS_POOL_V1, TRYB_POOL_V1, XIDR_POOL_V1, EUROC_POOL_V1, GYEN_POOL_V1,
    XSGD_STAKING, CADC_STAKING, EURS_STAKING, NZDS_STAKING, TRYB_STAKING, XIDR_STAKING, EUROC_STAKING, GYEN_STAKING,
    ZAP_ADDRESS_V1, ZAP_OPTIMIZED_ADDRESS_V1, ZAP_LEGACY_ADDRESS_V1,
} from "../../../packages/constants/index"

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
  
export function convertTokenToDecimal(
    tokenAmount: BigInt,
    exchangeDecimals: BigInt
): BigDecimal {
    if (exchangeDecimals == BigInt.fromI32(0)) {
        return tokenAmount.toBigDecimal();
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
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

export function isStakingContract(tokenAddress: string): boolean {
    if (tokenAddress == XSGD_STAKING) {
        return true
    } else if (tokenAddress == CADC_STAKING) {
        return true
    } else if (tokenAddress == EURS_STAKING) {
        return true
    } else if (tokenAddress == NZDS_STAKING) {
        return true
    } else if (tokenAddress == TRYB_STAKING) {
        return true
    } else if (tokenAddress == XIDR_STAKING){
        return true
    } else if (tokenAddress == EUROC_STAKING){
        return true
    } else if (tokenAddress == GYEN_STAKING){
        return true
    } else {
        return false
    }
}

export function isZapContract(tokenAddress: string): boolean {
    if (tokenAddress == ZAP_ADDRESS_V1) {
        return true
    } else if (tokenAddress == ZAP_OPTIMIZED_ADDRESS_V1) {
        return true
    } else if (tokenAddress == ZAP_LEGACY_ADDRESS_V1) {
        return true
    } else {
        return false
    }
}

export function fetchStakingContract(tokenAddress: string): string {
    // Replaced by dividing the current trades and storing the rates inside hourly pairs / daily.
    if (tokenAddress == XSGD_POOL_V1) {
        return XSGD_STAKING
    } else if (tokenAddress == CADC_POOL_V1) {
        return CADC_STAKING
    } else if (tokenAddress == EURS_POOL_V1) {
        return EURS_STAKING
    } else if (tokenAddress == NZDS_POOL_V1){
        return NZDS_STAKING
    } else if (tokenAddress == TRYB_POOL_V1){
        return TRYB_STAKING
    } else if (tokenAddress == XIDR_POOL_V1){
        return XIDR_STAKING
    } else if (tokenAddress == EUROC_POOL_V1) {
        return EUROC_STAKING
    } else if (tokenAddress == GYEN_POOL_V1) {
        return GYEN_STAKING
    } else {
        return ""
    }
}

export function fetchRewardDuration(tokenAddress: string): BigInt {
    let stakingAddress = fetchStakingContract(tokenAddress)
    if (stakingAddress) {
        let contract = Staking.bind(Address.fromString(stakingAddress))
        if (contract) {
            return contract.rewardsDuration()
        }
    }
    return ZERO_BI
}

export function fetchRewardsForDuration(tokenAddress: string): BigDecimal {
    let stakingAddress = fetchStakingContract(tokenAddress)
    if (stakingAddress) {
        let contract = Staking.bind(Address.fromString(stakingAddress))
        if (contract) {
            return convertTokenToDecimal(contract.getRewardForDuration(), BigInt.fromString('18'))
        }
    }
    return ZERO_BD
}

export function fetchTotalStaked(tokenAddress: string): BigDecimal {
    let stakingAddress = fetchStakingContract(tokenAddress)
    if (stakingAddress) {
        let contract = Staking.bind(Address.fromString(stakingAddress))
        if (contract) {
            return convertTokenToDecimal(contract.totalSupply(), BigInt.fromString('18'))
        }
    }
    return ZERO_BD
}