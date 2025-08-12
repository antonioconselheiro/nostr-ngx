import { NostrMetadata } from '@belomonte/nostr-ngx';
import { AuthModalSteps } from './auth-modal-steps.type';

export interface AuthModalArguments {
  title?: string;
  currentAuthProfile?: NostrMetadata | null;
  currentStep?: AuthModalSteps | null;
}
