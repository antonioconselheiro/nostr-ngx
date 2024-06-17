import { Injectable } from '@angular/core';
import { TNcryptsec, TNostrPublic, TNostrSecret, NostrConverter } from '@belomonte/nostr-ngx';
import { toDataURL } from 'qrcode';

@Injectable()
export class QrcodeCredentialService {

  constructor(
    private nostrConverter: NostrConverter
  ) {}

  nsecQRCode(nsec: TNostrSecret, title?: string | null): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const user = this.nostrConverter.convertNsecToNpub(nsec);

    canvas.setAttribute('height', '450px');
    canvas.setAttribute('width', '420px');

    if (ctx && title) {
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000';
      ctx.font = '22px "Segoe UI", Roboto, "Noto Sans", Helvetica, Arial, sans-serif';
      ctx.fillText(title, 20, 25);
      ctx.font = '11px "Segoe UI", Roboto, "Noto Sans", Helvetica, Arial, sans-serif';
      ctx.fillText(user.npub, 20, 430);

      return new Promise((resolve, reject) => {
        toDataURL(nsec, { margin: 0 }, (err, url) => {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }

          var img = new Image();
          img.src = url;
          
          img.onload = () => {
            ctx.drawImage(img, 20, 45, 370, 370);
            resolve(canvas.toDataURL('image/png'))
          };
        });
      });
    }

    return Promise.resolve('');
  }

  ncryptsecQRCode(ncryptsec: TNcryptsec, npub: TNostrPublic, title?: string): string {
    return '';
  }
}
