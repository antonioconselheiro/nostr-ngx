import { IProfile } from '../domain/profile.interface';
import { TAuthModalSteps } from './auth-modal-steps.type';

export interface IAuthModalArguments {
  title?: string;
  currentAuthProfile?: IProfile | null;
  currentStep?: TAuthModalSteps | null;
}
