import {Injectable} from '@angular/core';
import {HttpService} from './http-service';
import {ExclusionGroup} from '../models/ExclusionGroup';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {createExclusionGroup, getExclusionGroups, updateExclusionGroup} from '../ngrx/encounters-prevention/excusion-groups/actions';
import {
  getCurrentExclusionGroup,
  getExclusionGroupsCollection
} from '../ngrx/encounters-prevention/excusion-groups/states/exclusion-groups-getters.state';

@Injectable({
  providedIn: 'root'
})
export class EncounterPreventionService {

  exclusionGroups$: Observable<ExclusionGroup[]> = this.store.select(getExclusionGroupsCollection);
  updatedExclusionGroup$: Observable<ExclusionGroup> = this.store.select(getCurrentExclusionGroup);

  constructor(private http: HttpService, private store: Store<AppState>) { }

  getExclusionGroupsRequest() {
    this.store.dispatch(getExclusionGroups());
  }

  getExclusionGroups(): Observable<ExclusionGroup[]> {
    return this.http.get('v1/exclusion_groups');
  }

  createExclusionGroupRequest(group) {
    this.store.dispatch(createExclusionGroup({groupData: group}));
  }

  createExclusionGroup(group): Observable<ExclusionGroup> {
    return this.http.post(`v1/exclusion_groups`, group);
  }

  updateExclusionGroupRequest(group, updateFields) {
    this.store.dispatch(updateExclusionGroup({group, updateFields}));
  }

  updateExclusionGroup(group: ExclusionGroup, updateFields) {
    return this.http.patch(`v1/exclusion_groups/${group.id}`, updateFields);
  }
}
