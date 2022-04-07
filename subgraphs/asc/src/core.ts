import { Address, BigInt } from "@graphprotocol/graph-ts"

import {
  ZERO_BD,
  ZERO_BI,
  isStakingContract,
  convertTokenToDecimal,
} from "./helpers";

import {
  Transfer as TransferEvent,
  Approval,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Unpaused,
} from "../generated/ASC/ASC";

import {
  Transfer,
  ASC,
} from "../generated/schema"

import {
  BLACKHOLE_ADDRESS,
  DFX_MULTISIG_ADDRESS,
  DFX_CADC_PROXY,
  CADC,
  DFX,
} from "../../../packages/constants/index"

import { ERC20 } from '../generated/ASC/ERC20'
import { updateASCDayData } from "./asc-day-data";
import { updateASCHourData } from "./asc-hour-data";

export function handleTransfer(event: TransferEvent): void {
  let asc = ASC.load(DFX_CADC_PROXY)
  if (asc === null) {
    asc = new ASC(DFX_CADC_PROXY)
    asc.reserveDfx = ZERO_BD
    asc.reserveCadc = ZERO_BD
    asc.totalMintVolume = ZERO_BD
    asc.totalBurnVolume = ZERO_BD
  }
  asc.save()

  let entity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.timestamp = event.block.timestamp;
  entity.from = event.params.from
  entity.to = event.params.to
  entity.token0Amount = ZERO_BD
  entity.token1Amount = ZERO_BD
  entity.value = event.params.value

  let amount = ZERO_BD        
  amount = convertTokenToDecimal(event.params.value, BigInt.fromI32(18))

  let cadcContract = ERC20.bind(Address.fromString(CADC))
  let reserveCadcResult = cadcContract.try_balanceOf(event.address)
  let reserveCadcDiff = ZERO_BD
  if (!reserveCadcResult.reverted){
    let reserveCadc = convertTokenToDecimal(reserveCadcResult.value, BigInt.fromI32(18))
    reserveCadcDiff = reserveCadc.minus(asc.reserveCadc)
    entity.token0Amount = reserveCadcDiff
    asc.reserveCadc = reserveCadc
  }

  let dfxContract = ERC20.bind(Address.fromString(DFX))
  let reserveDfxResult = dfxContract.try_balanceOf(event.address)
  let reserveDfxDiff = ZERO_BD
  if (!reserveDfxResult.reverted){
    let reserveDfx = convertTokenToDecimal(reserveDfxResult.value, BigInt.fromI32(18))
    reserveDfxDiff = reserveDfx.minus(asc.reserveDfx)
    entity.token1Amount = reserveDfxDiff
    asc.reserveDfx = reserveDfx
  }

  if (event.params.to.toHexString() == DFX_MULTISIG_ADDRESS) {
    entity.type = "mint-burn-fee"
    asc.totalBurnVolume = asc.totalBurnVolume.plus(amount)
  } else if (event.params.from.toHexString() == BLACKHOLE_ADDRESS) {
    entity.type = "mint"
    asc.totalMintVolume = asc.totalMintVolume.plus(amount)
  } else if (event.params.to.toHexString() == BLACKHOLE_ADDRESS) {
    entity.type = "burn"
  } else if (isStakingContract(event.params.to.toHexString())){
    entity.type = "stake"
  } else if (isStakingContract(event.params.from.toHexString())){
    entity.type = "unstake"
  } else {
    entity.type = "transfer"
  }

  let ascDayData = updateASCDayData(event)
  let ascHourData = updateASCHourData(event)
  if (entity.type === "mint") {
    ascDayData.mintVolume = ascDayData.mintVolume.plus(amount)
    ascHourData.mintVolume = ascHourData.mintVolume.plus(amount)
  } else if (entity.type === "burn") {
    ascDayData.burnVolume = ascDayData.burnVolume.plus(amount)
    ascHourData.burnVolume = ascHourData.burnVolume.plus(amount)
  }
  ascDayData.save()
  ascHourData.save()
  
  
  asc.save()
  entity.save()
}

export function handleApproval(event: Approval): void {}

export function handlePaused(event: Paused): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleUnpaused(event: Unpaused): void {}
