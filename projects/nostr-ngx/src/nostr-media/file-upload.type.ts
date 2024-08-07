import { IFileProcessing } from './file-processing.interface';
import { IFileSending } from './file-sending.interface';
import { IFileUploadCompleted } from './file-upload-completed.interface';

export type TFileUpload = IFileSending & IFileProcessing & IFileUploadCompleted;
