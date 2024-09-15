import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Ncryptsec, NSec } from '@belomonte/nostr-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'nostr-modal-ncryptsec-decrypt',
  templateUrl: './modal-ncryptsec-decrypt.component.html'
})
export class ModalNcryptsecDecryptComponent extends ModalableDirective<Ncryptsec, NSec> {
  response = new Subject<void | NSec>;
}
