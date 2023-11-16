import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { GaugeRewardReceived } from "../generated/ChildChainReceiver/ChildChainReceiver"

export function createGaugeRewardReceivedEvent(
  messageId: Bytes,
  sourceChainSelector: BigInt,
  sender: Address,
  token: Address,
  tokenAmount: BigInt
): GaugeRewardReceived {
  let gaugeRewardReceivedEvent = changetype<GaugeRewardReceived>(newMockEvent())

  gaugeRewardReceivedEvent.parameters = new Array()

  gaugeRewardReceivedEvent.parameters.push(
    new ethereum.EventParam(
      "messageId",
      ethereum.Value.fromFixedBytes(messageId)
    )
  )
  gaugeRewardReceivedEvent.parameters.push(
    new ethereum.EventParam(
      "sourceChainSelector",
      ethereum.Value.fromUnsignedBigInt(sourceChainSelector)
    )
  )
  gaugeRewardReceivedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  gaugeRewardReceivedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  gaugeRewardReceivedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmount",
      ethereum.Value.fromUnsignedBigInt(tokenAmount)
    )
  )

  return gaugeRewardReceivedEvent
}
