import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Ncryptsec, NSec } from 'nostr-tools/nip19';
import { Subject } from 'rxjs';

@Component({
  selector: 'nostr-modal-ncryptsec-decrypt',
  templateUrl: './modal-ncryptsec-decrypt.component.html'
})
export class ModalNcryptsecDecryptComponent extends ModalableDirective<Ncryptsec, NSec> {
  response = new Subject<void | NSec>;
}
