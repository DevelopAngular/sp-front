import { createAction, props } from '@ngrx/store';

const INTROS = 'INTROS';

type UpdateIntrosProps = { intros: any; device: string; version: string };

export const getIntros = createAction(`[${INTROS}] Get Intros`);
export const getIntrosSuccess = createAction(`[${INTROS}] Get Intros Success`, props<{ data: any }>());
export const getIntrosFailure = createAction(`[${INTROS}] Get Intros Failure`, props<{ errorMessage: string }>());

export const updateIntros = createAction(`[${INTROS}] Update intros`, props<UpdateIntrosProps>());
export const updateIntrosSuccess = createAction(`[${INTROS}] Update intros Success`, props<{ data: any }>());
export const updateIntrosFailure = createAction(`[${INTROS}] Update intros Failure`, props<{ errorMessage: string }>());

export const updateIntrosMain = createAction(`[${INTROS}] Update intros Main`, props<UpdateIntrosProps>());
export const updateIntrosMainSuccess = createAction(`[${INTROS}] Update intros Main Success`, props<{ data: any }>());
export const updateIntrosMainFailure = createAction(`[${INTROS}] Update intros Main Failure`, props<{ errorMessage: string }>());

export const updateIntrosEncounter = createAction(`[${INTROS}] Update intros Encounter`, props<UpdateIntrosProps>());
export const updateIntrosShowRoomAsOrigin = createAction(`[${INTROS}] Update intros Show Room As Origin`, props<UpdateIntrosProps>());
export const updateIntrosEncounterSuccess = createAction(`[${INTROS}] Update intros Encounter Success`, props<{ data: any }>());
export const updateIntrosEncounterFailure = createAction(`[${INTROS}] Update intros Encounter Failure`, props<{ errorMessage: string }>());

export const updateIntrosSearch = createAction(`[${INTROS}] Update intros Search`, props<UpdateIntrosProps>());
export const updateIntrosSearchSuccess = createAction(`[${INTROS}] Update intros Search Success`, props<{ data: any }>());
export const updateIntrosSearchFailure = createAction(`[${INTROS}] Update intros Search Failure`, props<{ errorMessage: string }>());

export const updateIntrosHelpCenter = createAction(
	`[${INTROS}] Update intros Help Center`,
	props<{ intros: any; device: string; version: string }>()
);
export const updateIntrosHelpCenterSuccess = createAction(`[${INTROS}] Update intros Help Center Success`, props<{ data: any }>());
export const updateIntrosHelpCenterFailure = createAction(`[${INTROS}] Update intros Help Center Failure`, props<{ errorMessage: string }>());

export const updateIntrosDisableRoom = createAction(
	`[${INTROS}] Update intros Disable Room`,
	props<{ intros: any; device: string; version: string }>()
);
export const updateIntrosDisableRoomSuccess = createAction(`[${INTROS}] Update intros Disable Room Success`, props<{ data: any }>());
export const updateIntrosDisableRoomFailure = createAction(`[${INTROS}] Update intros Disable Room Failure`, props<{ errorMessage: string }>());

export const updateIntrosStudentPassLimits = createAction(
	`[${INTROS}] Update intros Student Pass Limits`,
	props<{ intros: any; device: string; version: string }>()
);
export const updateIntrosStudentPassLimitsSuccess = createAction(`[${INTROS}] Update intros Student Pass Limits Success`, props<{ data: any }>());

export const updateIntrosStudentPassLimitsFailure = createAction(
	`[${INTROS}] Update intros Student Pass Limits Failure`,
	props<{ errorMessage: string }>()
);

export const updateIntrosShowAsOriginRoomSuccess = createAction(`[${INTROS}] Update intros Show As Origin Room Success`, props<{ data: any }>());

export const updateIntrosShowRoomAsOriginFailure = createAction(
	`[${INTROS}] Update intros Show As Origin Room Failure`,
	props<{ errorMessage: string }>()
);

export const updateIntrosAdminPassLimitsMessage = createAction(`[${INTROS}] Update intros Admin Pass Limits Message`, props<UpdateIntrosProps>());
export const updateIntrosAdminPassLimitsMessageSuccess = createAction(
	`[${INTROS}] Update intros Admin Pass Limits Message Success`,
	props<{ data: any }>()
);
export const updateIntrosAdminPassLimitsMessageFailure = createAction(
	`[${INTROS}] Update intros Admin Pass Limits Message Failure`,
	props<{ errorMessage: string }>()
);

export const updateIntrosWaitInLine = createAction(`[${INTROS}] Update intros Wait In Line`, props<UpdateIntrosProps>());
export const updateIntrosWaitInLineSuccess = createAction(`[${INTROS}] Update intros Wait In Line Success`, props<{ data: any }>());
export const updateIntrosWaitInLineFailure = createAction(`[${INTROS}] Update intros Wait In Line Failure`, props<{ errorMessage: string }>());

export const updateIntrosPassLimitsOnlyCertainRooms = createAction(
	`[${INTROS}] Update intros Pass limits Only Certain Rooms`,
	props<UpdateIntrosProps>()
);

export const updateIntrosPassLimitsOnlyCertainRoomsSuccess = createAction(
	`[${INTROS}] Update intros Pass limits Only Certain Rooms Success`,
	props<{ data: any }>()
);
export const updateIntrosPassLimitsOnlyCertainRoomsFailure = createAction(
	`[${INTROS}] Update intros Pass limits Only Certain Rooms Failure`,
	props<{ errorMessage: string }>()
);

export const updateIntrosSeenRenewalStatusPage = createAction(`[${INTROS}] Update intros Seen Renewal Status Page`, props<UpdateIntrosProps>());

export const updateIntrosSeenRenewalStatusPageSuccess = createAction(
	`[${INTROS}] Update intros Seen Renewal Status Page Success`,
	props<{ data: any }>()
);
export const updateIntrosSeenRenewalStatusPageFailure = createAction(
	`[${INTROS}] Update intros Seen Renewal Status Page Failure`,
	props<{ errorMessage: string }>()
);

export const updateIntrosSeenReferralNux = createAction(`[${INTROS}] Update intros Seen Referral Nux`, props<UpdateIntrosProps>());

export const updateIntrosSeenReferralNuxSuccess = createAction(`[${INTROS}] Update intros Seen Referral Nux Success`, props<{ data: any }>());

export const updateIntrosSeenReferralNuxFailure = createAction(
	`[${INTROS}] Update intros Seen Referral Nux Failure`,
	props<{ errorMessage: string }>()
);

export const updateIntrosSeenReferralSuccessNux = createAction(`[${INTROS}] Update intros Seen Referral Success Nux`, props<UpdateIntrosProps>());

export const updateIntrosSeenReferralSuccessNuxSuccess = createAction(
	`[${INTROS}] Update intros Seen Referral Success Nux Success`,
	props<{ data: any }>()
);

export const updateIntrosSeenReferralSuccessNuxFailure = createAction(
	`[${INTROS}] Update intros Seen Referral Success Nux Failure`,
	props<{ errorMessage: string }>()
);
