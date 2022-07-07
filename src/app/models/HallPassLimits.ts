import {BaseModel} from './base';

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

export interface IndividualPassLimit {
  passLimit: number;
  description: string;
  studentId: number;
}
