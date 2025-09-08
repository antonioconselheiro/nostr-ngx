import { NostrEventWithRelays } from "../domain/event/nostr-event-with-relays.interface";
import { NostrEventIdViewModel } from "../domain/view-model/nostr-event-id.view-model";

export interface SingleViewModelMapper<ViewModelData extends NostrEventIdViewModel> {
  /**
   * cast a nostr event into ready to render data
   */
  toViewModel(event: NostrEventWithRelays): ViewModelData;
}