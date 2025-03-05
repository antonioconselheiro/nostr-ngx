import { Injectable } from "@angular/core";
import { AccountOpenable } from "../domain/account/compose/account-openable.type";
import { AccountRenderable } from "../domain/account/compose/account-renderable.type";
import { AccountSession } from "../domain/account/compose/account-session.type";
import { AccountCalculated } from "../domain/account/account-calculated.interface";
import { AccountEssential } from "../domain/account/account-essential.interface";
import { AccountPointable } from "../domain/account/account-pointable.interface";
import { AccountComplete } from "../domain/account/account-complete.interface";
import { AccountAuthenticable } from "../domain/account/account-authenticable.interface";
import { AccountRaw } from "../domain/account/account-raw.interface";

@Injectable({
  providedIn: 'root'
})
export class AccountGuard {

  /**
   * @returns account is raw
   */
  isRaw(account: unknown): account is AccountRaw {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (account.state === 'raw') {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is calculated
   */
  isCalculated(account: unknown): account is AccountCalculated {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (account.state === 'calculated') {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is essential
   */
  isEssential(account: unknown): account is AccountEssential {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (account.state === 'essential') {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is pointable
   */
  isPointable(account: unknown): account is AccountPointable {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (account.state === 'pointable') {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is complete
   */
  isComplete(account: unknown): account is AccountComplete {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (account.state === 'complete') {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is authenticable
   */
  isAuthenticable(account: unknown): account is AccountAuthenticable {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (account.state === 'authenticable') {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is complete or more (authenticable) 
   */
  isSessionGroup(account: unknown): account is AccountSession {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (['complete', 'authenticable'].includes(account.state)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is pointable or more (complete, authenticable) 
   */
  isOpenableGroup(account: unknown): account is AccountOpenable {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (['pointable', 'complete', 'authenticable'].includes(account.state)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns account is essential or more (pointable, complete, authenticable) 
   */
  isRenderableGroup(account: unknown): account is AccountRenderable {
    if (account instanceof Object && 'pubkey' in account && 'state' in account && typeof account.state === 'string') {
      if (['essential', 'pointable', 'complete', 'authenticable'].includes(account.state)) {
        return true;
      }
    }

    return false;
  }
}