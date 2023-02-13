import { HallPass } from './HallPass';
import { Invitation } from './Invitation';
import { Request } from './Request';
import { WaitingInLinePass } from './WaitInLine';

export interface Paged<T> {
	results: T[];
	prev: string;
	next: string;
}

export interface HallPassSummary {
	active_pass: HallPass;
	pass_history: HallPass[];
	future_passes: HallPass[];
}

export type PassLike = HallPass | Invitation | Request | WaitingInLinePass;

export function includesPassLike<T extends PassLike>(array: T[], item: T) {
	return array.find((p) => p.id === item.id);
}

export function exceptPasses<T extends PassLike>(array: T[], excluded: T[]) {
	return array.filter((item) => !includesPassLike(excluded, item));
}

export const snakeToTitleCase = (key: string): string => {
  return key.split('_').map(str => `${str[0].toUpperCase()}${str.slice(1)}`).join('')
}
