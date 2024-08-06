import { Component, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalBuilder, ModalOutletComponent } from '@belomonte/async-modal-ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nostr-credential-handler',
  templateUrl: './credential-handler.component.html',
  styleUrl: './credential-handler.component.scss'
})
export class CredentialHandlerComponent implements OnInit, OnDestroy {

  @ViewChild(ModalOutletComponent)
  modal!: ModalOutletComponent;
  
  title = '';

  isOpen = false;

  @HostBinding('style.display')
  get display(): string {
    return this.isOpen ? 'flex' : 'none';
  }

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscribeModalData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  private subscribeModalData(): void {
    this.subscriptions.add(ModalBuilder.modalInject$.subscribe({
      next: metadata => {
        //  casting from unknown
        const data = Object(metadata.data);
        if ('title' in data) {
          this.title = data.title;
        }
      }
    }));
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.modal.close();
  }
}
