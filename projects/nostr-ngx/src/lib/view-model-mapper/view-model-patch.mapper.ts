import { NostrEventWithRelays } from "../domain/event/nostr-event-with-relays.interface";
import { RelayDomain } from "../domain/view-model/relay-domain.type";

/**
 * Service implement this to indicate that there is a way
 * to feed a existing view model data with new events
 */
export interface ViewModelPatch<ViewModelData> {

  /**
   * add relationed data to view model
   */
  patchViewModel(viewModel: ViewModelData, events: Array<NostrEventWithRelays>, origin: Array<RelayDomain>): ViewModelData;

  /**
   * index relationed data to view model
   */
  indexViewModel(viewModel: ViewModelData, events: Array<NostrEventWithRelays>, origin: Array<RelayDomain>): ViewModelData;
}
