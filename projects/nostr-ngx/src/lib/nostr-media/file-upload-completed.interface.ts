import { FileMetadataObject } from 'nostr-tools/nip94';

export interface FileUploadCompleted {
  type: 'complete';
  downloadUrl: string;
  metadata?: FileMetadataObject;
}
