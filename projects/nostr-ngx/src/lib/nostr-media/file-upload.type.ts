import { FileProcessing } from './file-processing.interface';
import { FileSending } from './file-sending.interface';
import { FileUploadCompleted } from './file-upload-completed.interface';

export type FileUpload = FileSending | FileProcessing | FileUploadCompleted;
