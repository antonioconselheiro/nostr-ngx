import { Injectable } from '@angular/core';
import { InMemoryNCache } from '../injection-token/in-memory.ncache';

@Injectable({
  providedIn: 'root'
})
export class CacheInMemory extends InMemoryNCache {

}
