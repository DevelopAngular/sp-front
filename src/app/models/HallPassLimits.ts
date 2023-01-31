import { BaseModel } from './base';

export interface HallPassLimit extends BaseModel {
	id: string;
	schoolId: number;
	passLimit: number;
	frequency: 'day'; // TODO: add more when more frequencies are implemented
	limitEnabled: boolean;
}

export interface RemainingPasses extends BaseModel {
	remainingPasses: number;
}

export interface PassLimitInfo {
	showPasses: boolean;
	current?: number;
	max?: number;
}

interface ReducedUser {
	display_name: string;
	first_name: string;
	id: number;
	is_active: boolean;
	is_deleted: boolean;
	last_name: string;
	primary_email: string;
	profile_picture: string;
	username: string;
}

export interface IndividualPassLimit {
	student: ReducedUser;
	passLimit: number;
	description: string;
}

export interface IndividualPassLimitCollection {
	students: number[];
	passLimit: number;
	description: string;
}

export interface StudentPassLimit extends BaseModel {
	passLimit: number;
	description: string;
	isUnlimited: boolean;
	schoolPassLimitEnabled: boolean;
	isIndividual: boolean;
	noLimitsSet: boolean;
	student: ReducedUser;
}
