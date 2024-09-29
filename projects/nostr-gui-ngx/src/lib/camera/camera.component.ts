import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import QrScanner from 'qr-scanner';
import { Subscription } from 'rxjs';
import { CameraFunctions } from './camera-functions.enum';
import { CameraObservable } from './camera.observable';

@Component({
  selector: 'nostr-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit, OnDestroy {

  @ViewChild('video', { read: ElementRef })
  videoEl?: ElementRef<HTMLVideoElement>;
  scanning?: QrScanner;

  status: CameraFunctions | null = null;

  private subscriptions = new Subscription();

  constructor(
    private camera$: CameraObservable
  ) { }

  ngOnInit(): void {
    this.listenCameraObservable();
  }

  private listenCameraObservable(): void {
    this.subscriptions.add(this.camera$.asObservable().subscribe({
      next: status => {
        this.status = status;
        //  pulando para o final da fila para que o elemento
        //  de video fique disponível na estrutura do DOM
        setTimeout(() => this.onStatusUpdate(status));
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private onStatusUpdate(status: CameraFunctions | null): void {
    if (!status) {
      return;
    }

    const video = this.videoEl?.nativeElement;
    if (video) {
      if (status === CameraFunctions.READ_QR_CODE) {
        this.readQRCode(video);
      }
    }
  }

  private async readQRCode(video: HTMLVideoElement): Promise<void> {
    const qrScanner = new QrScanner(
      video, result => {
        this.camera$.qrCodeResponse.next(result.data);
        this.close();
      }, {}
    );

    const cameras = await QrScanner.listCameras();
    await qrScanner.setCamera(cameras[0].id);
    await qrScanner.start();
    return Promise.resolve();
  }

  close(): void {
    this.stopStreaming();
    this.stopScanning();
    this.completeSubscriptions();
  }

  private stopStreaming(): void {
    if (this.videoEl && this.videoEl.nativeElement) {
      const stream = this.videoEl.nativeElement.srcObject as MediaStream | null;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  private stopScanning(): void {
    if (this.scanning) {
      this.scanning.stop();
      this.scanning.destroy();
    }
  }

  private completeSubscriptions(): void {
    if (!this.camera$.qrCodeResponse.closed) {
      this.camera$.qrCodeResponse.complete();
    }

    this.camera$.next(null);
  }
}
