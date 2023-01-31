import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { ExclusionGroup } from '../models/ExclusionGroup';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../ngrx/app-state/app-state';
import {
	createExclusionGroup,
	getExclusionGroups,
	getExclusionGroupsForStudent,
	removeExclusionGroup,
	updateExclusionGroup,
} from '../ngrx/encounters-prevention/excusion-groups/actions';
import {
	exclusionGroupsForStudent,
	getCurrentExclusionGroup,
	getEncounterPreventionLength,
	getExclusionGroupsCollection,
	getExclusionGroupsLength,
	getExclusionGroupsLoaded,
	getExclusionGroupsLoading,
} from '../ngrx/encounters-prevention/excusion-groups/states/exclusion-groups-getters.state';
import { constructUrl } from '../live-data/helpers';
import { ToastService } from './toast.service';
import { HallPass } from '../models/HallPass';
import { Request } from '../models/Request';

interface EncounterPreventionToast {
	exclusionPass: HallPass | Request;
	isStaff?: boolean;
	exclusionGroups?: ExclusionGroup[];
}

@Injectable({
	providedIn: 'root',
})
export class EncounterPreventionService {
	exclusionGroups$: Observable<ExclusionGroup[]> = this.store.select(getExclusionGroupsCollection);
	exclusionGroupsLoading$: Observable<boolean> = this.store.select(getExclusionGroupsLoading);
	exclusionGroupsLoaded$: Observable<boolean> = this.store.select(getExclusionGroupsLoaded);
	updatedExclusionGroup$: Observable<ExclusionGroup> = this.store.select(getCurrentExclusionGroup);
	exclusionGroupsLength$: Observable<number> = this.store.select(getExclusionGroupsLength);
	encounterPreventionLength$: Observable<number> = this.store.select(getEncounterPreventionLength);

	exclusionGroupsForStudents$: Observable<{ [studentId: string]: ExclusionGroup[] }> = this.store.select(exclusionGroupsForStudent);

	constructor(private http: HttpService, private store: Store<AppState>, private toastService: ToastService) {}

	getExclusionGroupsRequest(queryParams?) {
		this.store.dispatch(getExclusionGroups({ queryParams }));
	}

	getExclusionGroupsForStudentRequest(id) {
		this.store.dispatch(getExclusionGroupsForStudent({ id }));
		return this.exclusionGroupsForStudents$;
	}

	getExclusionGroups(queryParams): Observable<ExclusionGroup[]> {
		return this.http.get(constructUrl('v1/exclusion_groups', queryParams));
	}

	createExclusionGroupRequest(group) {
		this.store.dispatch(createExclusionGroup({ groupData: group }));
	}

	createExclusionGroup(group): Observable<ExclusionGroup> {
		return this.http.post(`v1/exclusion_groups`, group);
	}

	updateExclusionGroupRequest(group, updateFields) {
		this.store.dispatch(updateExclusionGroup({ group, updateFields }));
		return this.updatedExclusionGroup$;
	}

	updateExclusionGroup(group: ExclusionGroup, updateFields) {
		return this.http.patch(`v1/exclusion_groups/${group.id}`, updateFields);
	}

	deleteExclusionGroupRequest(group: ExclusionGroup) {
		this.store.dispatch(removeExclusionGroup({ group }));
	}

	deleteExclusionGroup(groupId) {
		return this.http.delete(`v1/exclusion_groups/${groupId}`);
	}

	showEncounterPreventionToast({ exclusionPass, isStaff, exclusionGroups }: EncounterPreventionToast) {
		const title = isStaff ? "This pass can't start now to prevent encounter." : "Sorry, you can't start your pass right now.";

		const subtitle = isStaff ? "These students can't have a pass at the same time." : 'Please try again later.';

		this.toastService.openToast({
			title,
			subtitle,
			type: 'error',
			encounterPrevention: true,
			exclusionPass,
			exclusionGroups,
		});
	}
}
