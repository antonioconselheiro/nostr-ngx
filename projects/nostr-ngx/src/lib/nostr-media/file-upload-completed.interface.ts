import { FileMetadataObject } from 'nostr-tools/nip94';

export interface IFileUploadCompleted {
  type: 'complete';
  downloadUrl: string;
  metadata?: FileMetadataObject;
}
