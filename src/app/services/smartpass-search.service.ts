import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {Observable} from 'rxjs';
import {
  getSmartpassSearchLoaded,
  getSmartpassSearchLoading,
  getSmartpassSearchResult
} from '../ngrx/smartpass-search/states/smartpass-search-getters.state';
import {clearSearchResult, searchAction} from '../ngrx/smartpass-search/actions';

@Injectable({
  providedIn: 'root'
})
export class SmartpassSearchService {

  searchResult$: Observable<any[]> = this.store.select(getSmartpassSearchResult);
  searchLoading$: Observable<boolean> = this.store.select(getSmartpassSearchLoading);
  searchLoaded$: Observable<boolean> = this.store.select(getSmartpassSearchLoaded);

  constructor(private store: Store<AppState>) { }

  searchRequest(searchValue) {
    this.store.dispatch(searchAction({searchValue}));
  }

  clearResult() {
    this.store.dispatch(clearSearchResult());
  }
}
