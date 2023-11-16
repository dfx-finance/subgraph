import { GaugeRewardReceived as GaugeRewardReceivedEvent } from "../generated/ChildChainReceiver/ChildChainReceiver"
import { GaugeRewardReceived } from "../generated/schema"

export function handleGaugeRewardReceived(
  event: GaugeRewardReceivedEvent
): void {
  let entity = new GaugeRewardReceived(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.messageId = event.params.messageId
  entity.sourceChainSelector = event.params.sourceChainSelector
  entity.sender = event.params.sender
  entity.token = event.params.token
  entity.tokenAmount = event.params.tokenAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
