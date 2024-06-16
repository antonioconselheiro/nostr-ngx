import { Injectable } from '@angular/core';
import { base64 } from '@scure/base';

/**
 * Preciso prover meios deste serviço ser substituível
 * por serviços que integrem com cordova e capacitor
 */
@Injectable()
export class FileManagerService {

  private blobToBase64(blobFile?: Blob | null): Promise<string> {
    if (!blobFile) {
      return Promise.resolve('');
    }

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = event => {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) {
          return resolve('');
        }
  
        const uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer);
        return resolve(`data:${blobFile.type || 'image/png'};base64,` + base64.encode(uint8Array));
      };
  
      reader.readAsArrayBuffer(blobFile);
    });
  }

  save(base64File: Blob, name: string): void {
    const url = URL.createObjectURL(base64File);
    const a = document.createElement('a');
    document.body.appendChild(a);

    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);
  }

  async load(type = 'image/*'): Promise<string> {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', type);
    input.click();

    const file = await new Promise<File | null>(resolve => {
      input.addEventListener('change', () => {
        const file = input.files && input.files[0] || null;
        return resolve(file)
      });
    });

    if (!file) {
      return Promise.resolve('');
    }

    return this.blobToBase64(file);
  }
}
