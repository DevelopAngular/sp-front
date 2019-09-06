import { AppState } from '../../app-state/app-state';
import {groupsAdapter} from '../reducers';

export const getStudentGroupsState = (state: AppState) => state.studentGroups;

export const getStudentGroupsCollection = groupsAdapter.getSelectors(getStudentGroupsState).selectAll;
