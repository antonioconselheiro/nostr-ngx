import { AccountComplete } from "./account-complete.interface";
import { AccountEssential } from "./account-essential.interface";
import { AccountPointable } from "./account-pointable.interface";
import { AccountViewable } from "./account-viewable.interface";

export type AccountCacheable = AccountEssential | AccountPointable | AccountViewable | AccountComplete;
