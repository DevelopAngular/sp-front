import {BehaviorSubject, Observable, of} from 'rxjs';
import {PassLike} from './index';
import {tap} from 'rxjs/operators';

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
  loaded$ = new BehaviorSubject(false);

  constructor(private parent: PassLikeProvider) {
  }

  watch(sort?: Observable<string>) {

    return this.parent.watch(sort)
      .pipe(
        tap(passes => {
              this.loaded$.next(true);
              this.length$.next(passes.length);
      }));
  }

}
