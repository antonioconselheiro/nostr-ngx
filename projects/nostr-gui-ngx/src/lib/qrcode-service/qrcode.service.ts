import { Injectable } from '@angular/core';
import { toDataURL } from 'qrcode';

@Injectable()
export class QrcodeService {

  readonly qrcodeFont = ' "Segoe UI", Roboto, "Noto Sans", Helvetica, Arial, sans-serif';

  generateFileName(title?: string | null): string {
    let fileName = `${new Date().getTime()}.png`;
    if (title) {
      fileName = `${title.replace(/[,<>:"/\\|?*]/g, '')} - ${new Date().getTime()}.png`;
    }

    return fileName;
  }

  qrcodefy(content: string, title?: string | null): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.setAttribute('height', '430px');
    canvas.setAttribute('width', '420px');

    if (ctx) {
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000';
      if (title) {
        ctx.font = '22px' + this.qrcodeFont;
        ctx.fillText(title, 20, 25);
      }

      return new Promise((resolve, reject) => {
        toDataURL(content, { margin: 0 }, (err, url) => {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }

          const img = new Image();
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
}
