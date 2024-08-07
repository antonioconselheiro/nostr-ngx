import { FileMetadataObject } from 'nostr-tools/nip94';

export interface IFileUploadCompleted {
  type: 'complete';
  metadata?: FileMetadataObject;
}
