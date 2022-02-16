import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {Observable} from 'rxjs';
import {
  getResentSearch,
  getSmartpassSearchLoaded,
  getSmartpassSearchLoading,
  getSmartpassSearchResult
} from '../ngrx/smartpass-search/states/smartpass-search-getters.state';
import {clearSearchResult, postRecentSearch, searchAction} from '../ngrx/smartpass-search/actions';
import {HttpService} from './http-service';

@Injectable({
  providedIn: 'root'
})
export class SmartpassSearchService {

  searchResult$: Observable<any[]> = this.store.select(getSmartpassSearchResult);
  recentSearch$: Observable<any> = this.store.select(getResentSearch);
  searchLoading$: Observable<boolean> = this.store.select(getSmartpassSearchLoading);
  searchLoaded$: Observable<boolean> = this.store.select(getSmartpassSearchLoaded);

  constructor(
    private store: Store<AppState>,
    private http: HttpService
  ) { }

  searchRequest(searchValue) {
    this.store.dispatch(searchAction({searchValue}));
  }

  clearResult() {
    this.store.dispatch(clearSearchResult());
  }

  postSearchRequest(userId) {
    this.store.dispatch(postRecentSearch({userId}));
  }

  postSearch(userId) {
    return this.http.post('v1/recent_search', {user: +userId});
  }
}
