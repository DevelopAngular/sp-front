import {createAction, props} from '@ngrx/store';

const INTROS = 'INTROS';

export const getIntros = createAction(`[${INTROS}] Get Intros`);
export const getIntrosSuccess = createAction(`[${INTROS}] Get Intros Success`, props<{data: any}>());
export const getIntrosFailure = createAction(`[${INTROS}] Get Intros Failure`, props<{errorMessage: string}>());

export const updateIntros = createAction(`[${INTROS}] Update intros`, props<{intros: any, device: string, version: string}>());
export const updateIntrosSuccess = createAction(`[${INTROS}] Update intros Success`, props<{data: any}>());
export const updateIntrosFailure = createAction(`[${INTROS}] Update intros Failure`, props<{errorMessage: string}>());

export const updateIntrosMain = createAction(`[${INTROS}] Update intros Main`, props<{intros: any, device: string, version: string}>());
export const updateIntrosMainSuccess = createAction(`[${INTROS}] Update intros Main Success`, props<{data: any}>());
export const updateIntrosMainFailure = createAction(`[${INTROS}] Update intros Main Failure`, props<{errorMessage: string}>());

export const updateIntrosEncounter = createAction(`[${INTROS}] Update intros Encounter`, props<{intros: any, device: string, version: string}>());
export const updateIntrosEncounterSuccess = createAction(`[${INTROS}] Update intros Encounter Success`, props<{data: any}>());
export const updateIntrosEncounterFailure = createAction(`[${INTROS}] Update intros Encounter Failure`, props<{errorMessage: string}>());

export const updateIntrosSearch = createAction(`[${INTROS}] Update intros Search`, props<{intros: any, device: string, version: string}>());
export const updateIntrosSearchSuccess = createAction(`[${INTROS}] Update intros Search Success`, props<{data: any}>());
export const updateIntrosSearchFailure = createAction(`[${INTROS}] Update intros Search Failure`, props<{errorMessage: string}>());

export const updateIntrosDisableRoom = createAction(`[${INTROS}] Update intros Disable Room`, props<{intros: any, device: string, version: string}>());
export const updateIntrosDisableRoomSuccess = createAction(`[${INTROS}] Update intros Disable Room Success`, props<{data: any}>());
export const updateIntrosDisableRoomFailure = createAction(`[${INTROS}] Update intros Disable Room Failure`, props<{errorMessage: string}>());
