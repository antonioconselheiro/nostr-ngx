import { NostrEventWithRelays } from "../domain/event/nostr-event-with-relays.interface";
import { RelayDomainString } from "../domain/event/relay-domain-string.type";

/**
 * Service implement this to indicate that there is a way
 * to feed a existing view model data with new events
 */
export interface ViewModelPatch<ViewModelData> {

  /**
   * add relationed data to view model
   */
  patchViewModel(viewModel: ViewModelData, events: Array<NostrEventWithRelays>, origin: Array<RelayDomainString>): ViewModelData;

  /**
   * index relationed data to view model
   */
  indexViewModel(viewModel: ViewModelData, events: Array<NostrEventWithRelays>, origin: Array<RelayDomainString>): ViewModelData;
}
