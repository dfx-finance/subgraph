import { GaugeToggled as GaugeToggledEvent } from "../generated/dfxDistributor/dfxDistributor";
import { Gauge } from "../generated/schema";

/* -- Main -- */
/* Event Handlers */
// Watch GaugeToggled event to mark whether a gauge is "active" or "inactive"
export function handleGaugeToggled(event: GaugeToggledEvent): void {
  const addr = event.params.gaugeAddr;
  const isActive = !event.params.newStatus;

  let gauge = Gauge.load(addr.toHexString());
  if (gauge) {
    gauge.active = isActive;
    gauge.save();
  }
}
