import { AbstractRelay } from 'nostr-tools/relay';
import { Observable, Subject } from 'rxjs';

export function observeRelay(relay: AbstractRelay): {
  connection: Observable<boolean>;
  close: Observable<void>;
  notice: Observable<string>;
} {
  const hasObserve = (relay as any)._observe;
  if (hasObserve) {
    return hasObserve;
  }

  let _connected = (relay as any)._connected;
  const connection$ = new Subject<boolean>(),
    close$ = new Subject<void>(),
    notice$ = new Subject<string>();

  Object.defineProperty(relay, '_connected', {
    get: function() {
      return _connected;
    },
    set: function(conn) {
      _connected = conn;
      connection$.next(conn);
    },
    enumerable: true,
    configurable: true
  });

  const onclose = relay.onclose;
  const onnotice = relay.onnotice;
  relay.onclose = () => {
    close$.next();
    connection$.complete();
    close$.complete();
    notice$.complete();

    onclose && onclose();
  };

  relay.onnotice = (msg: string) => {
    notice$.next(msg);
    onnotice && onnotice(msg);
  };

  return (relay as any)._observe = {
    close: close$.asObservable(),
    connection: connection$.asObservable(),
    notice: notice$.asObservable()
  };
}
