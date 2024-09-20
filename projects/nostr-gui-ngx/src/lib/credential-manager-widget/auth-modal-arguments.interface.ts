import { NostrMetadata } from '@nostrify/nostrify';
import { AuthModalSteps } from './auth-modal-steps.type';

export interface AuthModalArguments {
  title?: string;
  currentAuthProfile?: NostrMetadata | null;
  currentStep?: AuthModalSteps | null;
}
