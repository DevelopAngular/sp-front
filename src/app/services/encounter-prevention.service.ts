import {Injectable} from '@angular/core';
import {HttpService} from './http-service';
import {ExclusionGroup} from '../models/ExclusionGroup';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {getExclusionGroups} from '../ngrx/encounters-prevention/excusion-groups/actions';
import {getExclusionGroupsCollection} from '../ngrx/encounters-prevention/excusion-groups/states/exclusion-groups-getters.state';

@Injectable({
  providedIn: 'root'
})
export class EncounterPreventionService {

  exclusionGroups$: Observable<ExclusionGroup[]> = this.store.select(getExclusionGroupsCollection);

  constructor(private http: HttpService, private store: Store<AppState>) { }

  getExclusionGroupsRequest() {
    this.store.dispatch(getExclusionGroups());
  }

  getExclusionGroups(): Observable<ExclusionGroup[]> {
    return this.http.get('v1/exclusion_groups');
  }
}
