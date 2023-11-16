import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { GaugeRewardReceived } from "../generated/schema"
import { GaugeRewardReceived as GaugeRewardReceivedEvent } from "../generated/ChildChainReceiver/ChildChainReceiver"
import { handleGaugeRewardReceived } from "../src/child-chain-receiver"
import { createGaugeRewardReceivedEvent } from "./child-chain-receiver-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let messageId = Bytes.fromI32(1234567890)
    let sourceChainSelector = BigInt.fromI32(234)
    let sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let token = Address.fromString("0x0000000000000000000000000000000000000001")
    let tokenAmount = BigInt.fromI32(234)
    let newGaugeRewardReceivedEvent = createGaugeRewardReceivedEvent(
      messageId,
      sourceChainSelector,
      sender,
      token,
      tokenAmount
    )
    handleGaugeRewardReceived(newGaugeRewardReceivedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("GaugeRewardReceived created and stored", () => {
    assert.entityCount("GaugeRewardReceived", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "GaugeRewardReceived",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "messageId",
      "1234567890"
    )
    assert.fieldEquals(
      "GaugeRewardReceived",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "sourceChainSelector",
      "234"
    )
    assert.fieldEquals(
      "GaugeRewardReceived",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "sender",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "GaugeRewardReceived",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "GaugeRewardReceived",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenAmount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
