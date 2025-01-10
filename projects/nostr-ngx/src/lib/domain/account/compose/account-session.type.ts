import { AccountAuthenticable } from '../account-authenticable.interface';
import { AccountComplete } from '../account-complete.interface';

/**
 * AccountSession is the name given for the union type of AccountComplete or AccountAuthenticable.
 * You can use it always you need a representation for AccountComplete or AccountAuthenticable type,
 * the name AccountSession represents the use of this library for this type combination.
 *
 * When data will be storage in session, whole user public data available is required and ncryptsec
 * is accepted.
 * 
 * This avoid force convert AccountAuthenticable into AccountComplete, and the ncryptsec in
 * AccountAuthenticable can be used to restore a lost session, if user isn't using the signer.
 */
export type AccountSession = AccountComplete | AccountAuthenticable;
