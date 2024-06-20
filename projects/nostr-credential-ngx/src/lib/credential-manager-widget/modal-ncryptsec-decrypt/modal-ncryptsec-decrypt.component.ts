import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'nostr-modal-ncryptsec-decrypt',
  templateUrl: './modal-ncryptsec-decrypt.component.html'
})
export class ModalNcryptsecDecryptComponent extends ModalableDirective<TNcryptsec, TNostrSecret> {
  response = new Subject<void | TNostrSecret>;
}
