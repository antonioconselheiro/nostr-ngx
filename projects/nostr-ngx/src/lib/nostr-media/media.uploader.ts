import { Injectable } from '@angular/core';
import { calculateFileHash, checkFileProcessingStatus, FileUploadResponse, generateDownloadUrl, OptionalFormDataFields, readServerConfig, ServerConfiguration, uploadFile, validateServerConfiguration } from 'nostr-tools/nip96';
import { normalizeURL } from 'nostr-tools/utils';
import { parseEvent } from 'nostr-tools/nip94';
import { Observable, Subject } from 'rxjs';
import { FileManagerService } from './file-manager.service';
import { FileUpload } from './file-upload.type';
import { NostrEvent } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class MediaUploader {

  /**
   * How many milliseconds to check upload status until upload complete
   */
  static checkUploadStatusTimieout = 2000;

  private static serverConfig: {
    [server: string]: ServerConfiguration
  } = {};

  static async readServerConfig(fileServerUrl: string): Promise<ServerConfiguration> {
    const normalizedUrl = normalizeURL(fileServerUrl);
    if (this.serverConfig[normalizedUrl]) {
      return Promise.resolve(this.serverConfig[normalizedUrl]);
    }

    const serverConfig = await readServerConfig(normalizedUrl);
    if (validateServerConfiguration(serverConfig)) {
      this.serverConfig[normalizedUrl] = serverConfig;
      return Promise.resolve(serverConfig);
    }

    const errorMessage = `file server "${normalizedUrl}" has an invalid config or is not available`;
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }

  constructor(
    private fileManager: FileManagerService
  ) { }

  /**
   * Upload file to file server using a file dialog limited to file server configured file types
   * 
   * TODO: pending to understand and implement the effect of 'delegated_to_url' property
   */
  uploadFromDialog(
    fileServer: string,
    params?: Omit<OptionalFormDataFields, 'size' | 'content_type'>
  ): Observable<FileUpload> {
    const subject = new Subject<FileUpload>();
    this.getFileFromDialog(fileServer).then(stuffLoaded => {
      if (stuffLoaded.file) {
        this.uploadFileWithAllStuffLoaded(stuffLoaded.serverConfig, stuffLoaded.file, stuffLoaded.fileHash, params).subscribe({
          next: subject.next,
          complete: subject.complete,
          error: subject.error
        });
      } else {
        subject.complete();
      }
    });

    return subject.asObservable();
  }

  /**
   * Upload a file to file server
   */
  uploadFromFile(
    fileServer: string,
    file: File,
    params?: Omit<OptionalFormDataFields, 'size' | 'content_type'>
  ): Observable<FileUpload> {
    const subject = new Subject<FileUpload>();
    readServerConfig(fileServer).then(serverConfig => {
      calculateFileHash(file).then(fileHash => {
        this.uploadFileWithAllStuffLoaded(serverConfig, file, fileHash, params).subscribe({
          next: subject.next,
          error: subject.error,
          complete: subject.complete,
        });
      })
    })

    return subject.asObservable();
  }

  private uploadFileWithAllStuffLoaded(
    serverConfig: ServerConfiguration,
    file: File,
    fileHash: string,
    params?: Omit<OptionalFormDataFields, 'size' | 'content_type'>
  ): Observable<FileUpload> {
    const subject = new Subject<FileUpload>();
    const stream = this.interceptFileToEmitSendingProgress(file, subject);

    //  TODO: preciso dar suporte para autenticação via NIP98 e para planos diferentes do free para NIP96
    //  Relay com plano de exemplo: eden.nostr.land
    uploadFile(stream, serverConfig.api_url, '', {
      ...params,
      size: String(file.size),
      content_type: file.type
    }).then(response => {
      if (response.status === 'error') {
        subject.error(response)
      }

      const downloadUrl = this.getFileDownloadUrl(serverConfig, file, fileHash);
      if (response.status === 'success') {
        this.sendCompleteResponse(subject, response, downloadUrl);
      } else if (response.processing_url) {
        this.listenFileProcessingToEmitProgress(response.processing_url, downloadUrl, subject);
      }
    });

    return subject.asObservable();
  }

  private sendCompleteResponse(
    subject: Subject<FileUpload>, response: FileUploadResponse, downloadUrl: string
  ): void {
    const nip94Event = response.nip94_event as any as NostrEvent | undefined;
    const metadata = nip94Event ? parseEvent(nip94Event) : undefined;
    subject.next({ type: 'complete', downloadUrl, metadata });
    subject.complete();
  }

  private getFileDownloadUrl(
    serverConfig: ServerConfiguration,
    file: File,
    fileHash: string
  ): string {
    const matchExtensionRegex = /(?:\.([^.]+))?$/;
    const [fileExtension] = Array.from(file.name.match(matchExtensionRegex) || []);

    return generateDownloadUrl(fileHash, serverConfig.download_url || serverConfig.api_url, fileExtension);
  }

  private async getFileFromDialog(fileServer: string): Promise<{
    file: null
  } | {
    file: File,
    serverConfig: ServerConfiguration,
    fileHash: string
  }> {
    const serverConfig = await readServerConfig(fileServer);
    const file = await this.fileManager.load({ format: 'file', type: serverConfig.content_types });
    if (!file) {
      return Promise.resolve({ file });
    }

    const fileHash = await calculateFileHash(file);
    return Promise.resolve({ file, fileHash, serverConfig });
  }

  private interceptFileToEmitSendingProgress(file: File, subject: Subject<FileUpload>): File {
    let uploadedAmount = 0;
    const stream = new ReadableStream({
      start(controller) {
        const reader = file.stream().getReader();
        function push(): void {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            uploadedAmount += value.byteLength;
            const percentage = uploadedAmount / file.size;
            subject.next({ type: 'sending', percentage });
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });

    //  nothing to see here, go away
    return stream as any as File;
  }

  private listenFileProcessingToEmitProgress(processing_url: string, imageDownloadUrl: string, subject: Subject<FileUpload>): void {
    checkFileProcessingStatus(processing_url).then(response => {
      if (response.status === 'success') {
        this.sendCompleteResponse(subject, response, imageDownloadUrl);
      } else if (response.status === 'processing' && 'percentage' in response) {
        const percentage = (response.percentage / 100);
        subject.next({ type: 'processing', percentage });
      }
    });
  }
}
