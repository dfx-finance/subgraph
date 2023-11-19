import { SetL2DestinationCall } from "../generated/CCIPSender/CCIPSender";
import { RootGauge } from "../generated/schema";

export function updateL2Destination(call: SetL2DestinationCall): void {
  const rootGauge = RootGauge.load(call.inputs.rootGauge.toHexString());
  if (rootGauge) {
    rootGauge.destination = call.inputs.receiver.toHexString();

    const chainSelector = call.inputs.chainSelector.toI64();
    if (chainSelector === 4051577828743386545) rootGauge.network = 137; // polygon
    if (chainSelector === 4949039107694359620) rootGauge.network = 42161; // arbitrum

    rootGauge.save();
  }
}
