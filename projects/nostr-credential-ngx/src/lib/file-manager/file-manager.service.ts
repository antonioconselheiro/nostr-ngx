import { Injectable } from '@angular/core';
import { base64 } from '@scure/base';

/**
 * TODO: preciso prover meios deste serviço ser substituível
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

  private base64ToBlob(base64File: string): Blob {
    const [,, type,, encoded] = Array.from(base64File.match(/(data:)([^ ]+)(;base64,)([^ ]+)/) || []);
    const binary = base64.decode(encoded);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary[i]);
    }
    return new Blob([new Uint8Array(array)], { type: type });
  }

  save(base64File: string, name: string): void {
    const url = URL.createObjectURL(this.base64ToBlob(base64File));
    const a = document.createElement('a');
    document.body.appendChild(a);

    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);
  }

  async load(params?: { type?: string, format: 'file' }): Promise<File | null>;
  async load(params?: { type?: string, format?: 'base64' }): Promise<string | null>;
  async load(params?: { type?: string, format?: 'file' | 'base64' }): Promise<File | string | null> {
    const defaults = { type: 'image/*', format: 'base64' };
    const paramsWithDefaultsFilled = { ...defaults, ...params };
    
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', paramsWithDefaultsFilled.type);
    input.click();

    const file = await new Promise<File | null>(resolve => {
      input.addEventListener('change', () => {
        const file = input.files && input.files[0] || null;
        return resolve(file)
      });
    });

    if (!file) {
      return Promise.resolve(null);
    }

    if (paramsWithDefaultsFilled.format === 'file') {
      return Promise.resolve(file);
    }

    return this.blobToBase64(file);
  }
}
