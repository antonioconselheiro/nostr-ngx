import { Injectable } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { CameraFunctions } from './camera-functions.enum';

@Injectable({
  providedIn: 'root'
})
export class CameraObservable extends Subject<CameraFunctions | null> {

  qrCodeResponse = new Subject<string>();

  async readQrCode(): Promise<string> {
    this.next(CameraFunctions.READ_QR_CODE);
    return firstValueFrom(this.qrCodeResponse.asObservable());
  }

  override next(status: CameraFunctions | null): void {
    if (status === CameraFunctions.READ_QR_CODE) {
      this.qrCodeResponse = new Subject<string>();
    }

    super.next(status);
  }
}
