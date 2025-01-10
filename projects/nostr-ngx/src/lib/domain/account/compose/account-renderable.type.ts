import { AccountAuthenticable } from '../account-authenticable.interface';
import { AccountComplete } from '../account-complete.interface';
import { AccountViewable } from '../account-viewable.interface';

/**
 * AccountRenderable is the name given for the union type of AccountViewable, AccountComplete or AccountAuthenticable.
 * 
 * When a profile should be rendered in document is expected that the data for showing profile image and data to open
 * this profile are available.
 */
export type AccountRenderable = AccountViewable | AccountComplete | AccountAuthenticable;
