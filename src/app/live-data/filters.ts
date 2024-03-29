import * as Fuse from 'fuse.js';
import { PassLike } from '../models';
import { BaseModel } from '../models/base';
import { HallPass } from '../models/HallPass';
import { State } from './state';

export function filterHallPasses(state: State<HallPass>): State<HallPass> {
	if (state.sort) {
		const compareString = (a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
		const combineComparisons = (...comparisons: number[]) => comparisons.find((c) => c !== 0) || 0;

		const sortFns = {
			created: (a: HallPass, b: HallPass) => +a.created - +b.created,
			expiration_time: (a: HallPass, b: HallPass) => +a.expiration_time - +b.expiration_time,
			start_time: (a: HallPass, b: HallPass) => +a.start_time - +b.start_time,
			destination_name: (a: HallPass, b: HallPass) => compareString(a.destination.title, b.destination.title),
			student_email: (a: HallPass, b: HallPass) => compareString(a.student.primary_email, b.student.primary_email),
			student_name: (a: HallPass, b: HallPass) =>
				combineComparisons(compareString(a.student.last_name, b.student.last_name), compareString(a.student.first_name, b.student.first_name)),
		};

		for (const key of Object.keys(sortFns)) {
			const sorter = sortFns[key];
			sortFns['-' + key] = (a, b) => -sorter(a, b);
		}

		if (sortFns[state.sort]) {
			state.passes = state.passes.sort(sortFns[state.sort]);
		} else {
			console.error(`Unknown sort type: ${state.sort}`);
			delete state.sort;
		}
	}

	if (state.filter_query && state.filter_query !== '') {
		const options = {
			shouldSort: true,
			threshold: 0.3,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 3,
			keys: ['student.display_name', 'student.first_name', 'student.last_name', 'destination.title', 'student.primary_email'] as any[],
		};

		const fuse = new Fuse(state.passes, options);
		state.filtered_passes = fuse.search(state.filter_query);
	} else {
		state.filtered_passes = state.passes;
	}

	return state;
}

export function filterNewestFirst<ModelType extends PassLike>(state: State<ModelType>): State<ModelType> {
	state.passes = state.passes.sort((a: ModelType, b: ModelType) => -(+a.created - +b.created));
	state.filtered_passes = state.passes;

	return state;
}

export function identityFilter<ModelType extends BaseModel>(state: State<ModelType>): State<ModelType> {
	state.filtered_passes = state.passes;

	return state;
}
