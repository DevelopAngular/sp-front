import {Injectable} from '@angular/core';
import {HttpService} from './http-service';
import {ExclusionGroup} from '../models/ExclusionGroup';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {
  createExclusionGroup,
  getExclusionGroups,
  removeExclusionGroup,
  updateExclusionGroup
} from '../ngrx/encounters-prevention/excusion-groups/actions';
import {
  getCurrentExclusionGroup,
  getEncounterPreventionLength,
  getExclusionGroupsCollection,
  getExclusionGroupsLoaded,
  getExclusionGroupsLoading
} from '../ngrx/encounters-prevention/excusion-groups/states/exclusion-groups-getters.state';
import {constructUrl} from '../live-data/helpers';

@Injectable({
  providedIn: 'root'
})
export class EncounterPreventionService {

  exclusionGroups$: Observable<ExclusionGroup[]> = this.store.select(getExclusionGroupsCollection);
  exclusionGroupsLoading$: Observable<boolean> = this.store.select(getExclusionGroupsLoading);
  exclusionGroupsLoaded$: Observable<boolean> = this.store.select(getExclusionGroupsLoaded);
  updatedExclusionGroup$: Observable<ExclusionGroup> = this.store.select(getCurrentExclusionGroup);
  encounterPreventionLength$: Observable<number> = this.store.select(getEncounterPreventionLength);

  constructor(private http: HttpService, private store: Store<AppState>) { }

  getExclusionGroupsRequest(queryParams?) {
    this.store.dispatch(getExclusionGroups({queryParams}));
  }

  getExclusionGroups(queryParams): Observable<ExclusionGroup[]> {
    return this.http.get(constructUrl('v1/exclusion_groups', queryParams));
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

  deleteExclusionGroupRequest(group: ExclusionGroup) {
    this.store.dispatch(removeExclusionGroup({group}));
  }

  deleteExclusionGroup(groupId) {
    return this.http.delete(`v1/exclusion_groups/${groupId}`);
  }
}
