import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { PassLike } from './index';

export interface PassLikeProvider {

  watch(sort: Observable<string>): Observable<PassLike[]>;
}

export class BasicPassLikeProvider {

  constructor(private passes: PassLike[]) {
  }

  watch(sort: Observable<string>) {
    return Observable.of(Array.from(this.passes));
  }
}

export class WrappedProvider implements PassLikeProvider {

  length$ = new BehaviorSubject(0);

  constructor(private parent: PassLikeProvider) {
  }

  watch(sort: Observable<string>) {
    return this.parent.watch(sort).do(passes => this.length$.next(passes.length));
  }

}
