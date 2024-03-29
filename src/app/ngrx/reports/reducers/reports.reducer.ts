import { Action, createReducer, on } from '@ngrx/store';
import { ReportsState } from '../states';
import * as reportsActions from '../actions';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Report, Status } from '../../../models/Report';
import { User } from '../../../models/User';
import { BaseModel } from '../../../models/base';

export const adapter: EntityAdapter<Report> = createEntityAdapter<Report>();

export const reportsInitialState: ReportsState = adapter.getInitialState({
	loading: false,
	loaded: false,
	currentReportId: null,
	next: null,
	reportsFound: [],
	addedReports: [],
});

// create fake reports data
const mocked = (n: number): Report[] => {
	// params for User constructor
	const basic = {
		active: true,
		created: new Date(),
		demo_account: true,
		last_login: new Date(),
		last_updated: new Date(),
		passes_restricted: false,
		primary_email: '',
		roles: [],
		reported_pass_id: null,
		reported_pass: null,
		status: 'test status',
		badge: '',
		sync_types: [''],
		show_expired_passes: true,
		show_profile_pictures: '',
		profile_picture: '',
		extras: '',
		first_login: new Date(),
		isSameObject: (that: BaseModel) => true,
		isAssignedToSchool: 1,
	};

	const mocks: Report[] = [];
	let student = {},
		teacher = {};
	for (let i = 1; i <= n; i++) {
		student = <unknown>{ ...basic, ...{ id: '' + i, first_name: 'Test ' + i, last_name: 'Student', display_name: 'Display name Student' + i } };
		teacher = <unknown>{ ...basic, ...{ id: '' + i, first_name: 'Test ' + i, last_name: 'Teacher', display_name: 'Display name Teacher' + i } };
		mocks.push({
			id: i + 100,
			student: student as User,
			reported_pass_id: null,
			reported_pass: null,
			message: 'test message ' + i,
			status: i % 2 == 0 ? Status.Active : Status.Closed,
			issuer: teacher as User,
			created: new Date(),
			last_updated: new Date(),
			isSameObject: (that: BaseModel) => true,
			isAssignedToSchool: (schoolId: number) => true,
		});
	}

	return mocks;
};

const reducer = createReducer(
	reportsInitialState,
	on(reportsActions.getReports, reportsActions.searchReports, reportsActions.postReport, (state) => ({
		...state,
		loading: true,
		loaded: false,
		currentReportId: null,
	})),
	on(reportsActions.getReportsSuccess, (state, { reports, next }) => {
		//TODO: remove it when done
		//reports = mocked(10);
		return adapter.addAll(reports, { ...state, loading: false, loaded: true, next });
	}),
	on(reportsActions.searchReportsSuccess, (state, { reports }) => {
		return {
			...state,
			loading: false,
			loaded: true,
			reportsFound: reports,
		};
	}),
	on(reportsActions.postReportSuccess, (state, { reports }) => {
		return adapter.addMany(reports, { ...state, loading: false, loaded: true, addedReports: reports });
	}),
	on(reportsActions.patchReport, (state) => ({ ...state, loading: false, loaded: false, currentReportId: null })),
	on(reportsActions.patchReportSuccess, (state, { report }) => {
		return adapter.upsertOne(report, { ...state, loading: false, loaded: true, currentReportId: report.id });
	}),
	on(reportsActions.getMoreReportsSuccess, (state, { reports, next }) => {
		return adapter.addMany(reports, { ...state, loading: false, loaded: true, next });
	})
);

export function reportsReducer(state: any | undefined, action: Action) {
	return reducer(state, action);
}
