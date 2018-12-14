import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { PassLike } from './index';

/**
 * Provides an Observable that emits arrays of PassLike objects. This is primarily used
 * by the PassCollectionComponent.
 *
 * @see PassLike
 */
export interface PassLikeProvider {

  watch(sort: Observable<string>): Observable<PassLike[]>;
}

/**
 * An implementation of PassLikeProvider that provides a static array of PassLike objects.
 */
export class BasicPassLikeProvider {

  constructor(private passes: PassLike[]) {
  }

  watch(sort: Observable<string>) {
    return of(Array.from(this.passes));
  }
}

/**
 * Wraps a PassLikeProvider to expose an observable of the total count of PassLike objects.
 */
export class WrappedProvider implements PassLikeProvider {

  length$ = new BehaviorSubject(0);

  constructor(private parent: PassLikeProvider) {
  }

  watch(sort: Observable<string>) {
    return this.parent.watch(sort).do(passes => this.length$.next(passes.length));
  }

}
