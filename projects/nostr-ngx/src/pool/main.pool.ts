import { Injectable } from '@angular/core';
import { NostrEvent, NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from '@nostrify/nostrify';
import { filter, from, map, Observable, of, takeUntil } from 'rxjs';
import { RouterService } from './router.service';
import { OverrideNPool } from './override.npool';

@Injectable({
  providedIn: 'root'
})
export class MainPool extends OverrideNPool {

  constructor(
    routerService: RouterService
  ) {
    super(routerService);
  }

  observe(filters: Array<NostrFilter>): Observable<NostrEvent> {
    const observable = from(this.req(filters));
    const closedSignal$ = observable.pipe(
      filter(([kind]) => kind === 'CLOSED'),
      takeUntil(of(undefined)) 
    );
  
    return observable
      .pipe(
        filter(([kind]) => kind === 'EVENT'),
        takeUntil(closedSignal$)
      ).pipe(map(([,,event]) => event as NostrEvent));
  }

  override req(
    filters: NostrFilter[],
    opts?: { signal?: AbortSignal, hint?: Array<string> | NostrEvent | Array<NostrEvent> },
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    return super.req(filters, opts);
  }
}
