import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, combineLatest, iif, Observable, of, Subject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, switchMap, take, takeUntil, tap, withLatestFrom, retryWhen, delay, concatMap, catchError } from 'rxjs/operators';
import { StudentFilterComponent } from './student-filter/student-filter.component';
import { StatusFilterComponent } from './status-filter/status-filter.component';
import { User } from '../../models/User';
import { HallPass } from '../../models/HallPass';
import { HallPassesService } from '../../services/hall-passes.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../../services/http-service';
import { School } from '../../models/School';
import { ContactTraceService } from '../../services/contact-trace.service';
import { ContactTrace } from '../../models/ContactTrace';
import { DateTimeFilterComponent } from './date-time-filter/date-time-filter.component';
import { UNANIMATED_CONTAINER } from '../../consent-menu-overlay';
import { StorageService } from '../../services/storage.service';
import { PassCardComponent } from '../../pass-card/pass-card.component';
import { cloneDeep, isEqual, omit } from 'lodash';
import { TableService } from '../sp-data-table/table.service';
import { ToastService } from '../../services/toast.service';
import { AdminService } from '../../services/admin.service';
import { constructUrl } from '../../live-data/helpers';
import { UserService } from '../../services/user.service';
import * as moment from 'moment';
import { Report, Status } from '../../models/Report';
import { Util } from '../../../Util';
import { Dictionary } from '@ngrx/entity';
import { ReportInfoDialogComponent } from './report-info-dialog/report-info-dialog.component';
import { XlsxService } from '../../services/xlsx.service';
import { ComponentsService } from '../../services/components.service';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import {
	ConfirmationDialogComponent,
	ConfirmationTemplates,
	RecommendedDialogConfig,
} from '../../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import { SpDataTableComponent } from '../sp-data-table/sp-data-table.component';
import { EncounterDetectionService } from '../../services/EncounterDetectionService';
import { EncounterDetection } from '../../models/EncounterDetection';
import { EncounterDetectionDialogComponent } from './encounter-detection-dialog/encounter-detection-dialog.component';
import { TotalAccounts } from '../../models/TotalAccounts';

declare const window: Window & typeof globalThis & { passClick: any; reportedPassClick: any };
type OverflownTries = HttpErrorResponse & { overflown: boolean };

export interface View {
	[view: string]: CurrentView;
}

export interface CurrentView {
	id: ExplorePages;
	title: string;
	color: string;
	icon: string;
	action: string;
	isPro?: boolean;
}

export enum ExplorePages {
	search = 1,
	report = 2,
	contact = 3,
	encounter = 4,
	rooms = 5,
}

export interface SearchData {
	selectedStudents: User[];
	selectedDate: { start: moment.Moment; end: moment.Moment };
	selectedDestinationRooms?: any[];
	selectedOriginRooms?: any[];
	selectedTeachers?: User[];
	selectedStatus?: Status;
	// used to restrain the search only to the ended passes
	onlyEnded?: boolean;
}

export interface PassRemovedResponse {
	dids: number[];
	error: Error | null;
}

@Component({
	selector: 'app-explore',
	templateUrl: './explore.component.html',
	styleUrls: ['./explore.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreComponent implements OnInit, OnDestroy {
	@ViewChild(SpDataTableComponent) passtable!: SpDataTableComponent;

	views: View = {
		pass_search: { id: ExplorePages.search, title: 'Passes', color: '#00B476', icon: 'Pass Search', action: 'pass_search' },
		report_search: { id: ExplorePages.report, title: 'Report Submissions', color: '#E32C66', icon: 'Report Search', action: 'report_search' },
		contact_trace: { id: ExplorePages.contact, title: 'Contact Trace', color: '#139BE6', icon: 'Contact Trace', action: 'contact_trace' },
		encounter_detection: {
			id: ExplorePages.encounter,
			title: 'Detected Encounters',
			color: '#1F195E',
			icon: 'Encounter Detection',
			action: 'encounter_detection',
		},
		// 'rooms_usage': {id: 4, title: 'Rooms Usage', color: 'orange', icon: 'Rooms Usage', action: 'rooms_usage'}
	};

	isCheckbox$: BehaviorSubject<boolean> = new BehaviorSubject(true);
	passSearchState: {
		loading$: Observable<boolean>;
		loaded$: Observable<boolean>;
		isEmpty?: boolean;
		sortPasses$?: Observable<string>;
		sortPassesLoading$?: Observable<boolean>;
		countPasses$?: Observable<number>;
		isAllSelected$: Observable<boolean>;
		nextUrl$: Observable<string>;
	};
	contactTraceState: {
		loading$: Observable<boolean>;
		loaded$: Observable<boolean>;
		length$: Observable<number>;
		isEmpty?: boolean;
	};
	reportSearchState: {
		loading$: Observable<boolean>;
		loaded$: Observable<boolean>;
		length$: Observable<number>;
		nextUrl$: Observable<string>;
		entities$: Observable<Dictionary<Report>>;
		isEmpty?: boolean;
	};
	encounterDetectedState: {
		loading$: Observable<boolean>;
		errored$: Observable<boolean>;
		isEmpty?: boolean;
		// sortEncounters$?: Observable<string>,
		// sortEncountersLoading$?: Observable<boolean>,
		// countEncounters$?: Observable<number>,
		isAllSelected$: Observable<boolean>;
		// nextUrl$: Observable<string>
	};
	isProUser: boolean;
	isSearched: boolean;
	showContactTraceTable: boolean;
	schools$: Observable<School[]>;

	passSearchData: SearchData = {
		selectedStudents: null,
		selectedOriginRooms: null,
		selectedDestinationRooms: null,
		selectedDate: null,
		onlyEnded: true,
	};
	contactTraceData: SearchData = {
		selectedStudents: null,
		selectedDate: null,
	};
	encounterDetectedData: any = {
		selectedStudents: null,
		selectedDate: null,
	};
	contact_trace_passes: {
		[id: number]: HallPass;
	} = {};

	reportSearchData: SearchData = {
		selectedStudents: null,
		selectedTeachers: null,
		selectedStatus: null,
		selectedDate: null,
	};

	searchedPassData$: Observable<any[]>;
	contactTraceData$: Observable<any[]>;
	reportsSearchData$: Observable<any[]>;
	encounterDetectionData$: Observable<any[]>;
	encounterDetectionCreatedAt$: Observable<String>;
	queryParams: any;

	adminCalendarOptions;

	currentView$: BehaviorSubject<string> = new BehaviorSubject<string>(this.storage.getItem('explore_page') || 'pass_search');

	sortColumn = 'Pass start time';
	currentColumns: any;
	selectedRows: any[] = [];
	allData: any[] = [];

	user$: Observable<User>;

	buttonForceTrigger$: Subject<any> = new Subject<any>();

	destroyPassClick = new Subject();
	destroy$ = new Subject();
	clickEventSubscription: Subscription;

	public accounts$: Observable<TotalAccounts> = this.adminService.countAccounts$;

	today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

	constructor(
		public dialog: MatDialog,
		private hallPassService: HallPassesService,
		private cdr: ChangeDetectorRef,
		private domSanitizer: DomSanitizer,
		private http: HttpService,
		private contactTraceService: ContactTraceService,
		private storage: StorageService,
		private tableService: TableService,
		private toastService: ToastService,
		private adminService: AdminService,
		public xlsx: XlsxService,
		private userService: UserService,
		private componentService: ComponentsService,
		private encounterDetectionService: EncounterDetectionService
	) {
		window.passClick = (id) => {
			this.passClick(id);
		};
		window.reportedPassClick = (id, invisBackdrop) => {
			this.openPassDialog(id, !!invisBackdrop);
		};
		if (window.history.state.open_on_load?.dialog === 'admin/explore/report_search') {
			this.currentView$.next('report_search');
		}
	}

	dateText({ start, end }): string {
		if (start.isSame(moment().subtract(3, 'days'), 'day')) {
			return 'Last 3 days';
		} else if (start.isSame(moment().subtract(7, 'days'), 'day')) {
			return 'Last 7 days';
		} else if (start.isSame(moment().subtract(30, 'days'), 'day')) {
			return 'Last 30 days';
		} else if (start.isSame(moment().subtract(90, 'days'), 'day')) {
			return 'Last 90 days';
		}
		if (start && end) {
			if (this.currentView$.getValue() === 'pass_search') {
				return this.passSearchData.selectedDate && start.isSame(end, 'day')
					? start.format('MMM D')
					: start.format('MMM D') + ' to ' + end.format('MMM D');
			} else if (this.currentView$.getValue() === 'encounter_detection') {
				return this.encounterDetectedData.selectedDate && start.isSame(end, 'day')
					? start.format('MMM D')
					: start.format('MMM D') + ' to ' + end.format('MMM D');
			} else {
				return this.contactTraceData.selectedDate && start.isSame(end, 'day')
					? start.format('MMM D')
					: start.format('MMM D') + ' to ' + end.format('MMM D');
			}
		}
	}

	ngOnInit() {
		this.schools$ = this.http.schoolsCollection$;
		this.clickEventSubscription = this.componentService.getClickEvent().subscribe((action) => {
			this.isProUser = !(action == 'encounter_detection' && !this.userService.getFeatureEncounterDetection());
			this.currentView$.next(action);
			this.storage.setItem('explore_page', action);
			this.cdr.detectChanges();
		});
		this.isProUser = !(this.currentView$.getValue() == 'encounter_detection' && !this.userService.getFeatureEncounterDetection());
		this.user$ = this.userService.user$;

		this.passSearchState = {
			loading$: this.hallPassService.passesLoading$,
			loaded$: this.hallPassService.passesLoaded$,
			sortPasses$: this.hallPassService.sortPassesValue$,
			sortPassesLoading$: this.hallPassService.sortPassesLoading$,
			countPasses$: this.hallPassService.currentPassesCount$,
			nextUrl$: this.hallPassService.passesNextUrl$,
			isAllSelected$: this.tableService.isAllSelected$,
		};
		this.encounterDetectedState = {
			loading$: this.encounterDetectionService.encounterLoading$,
			errored$: this.encounterDetectionService.encounterErrored$,
			// sortEncounters$: this.hallPassService.sortPassesValue$,
			// sortEncountersLoading$: this.hallPassService.sortPassesLoading$,
			// countEncounters$: this.hallPassService.currentPassesCount$,
			// nextUrl$: this.hallPassService.passesNextUrl$,
			isAllSelected$: this.tableService.isAllSelected$,
		};
		this.contactTraceState = {
			loading$: this.contactTraceService.contactTraceLoading$,
			loaded$: this.contactTraceService.contactTraceLoaded$,
			length$: this.contactTraceService.contactTraceTotalLength$,
		};
		this.reportSearchState = {
			loaded$: this.adminService.reports.loaded$,
			loading$: this.adminService.reports.loading$,
			length$: this.adminService.reports.length,
			nextUrl$: this.adminService.reports.nextUrl$,
			entities$: this.adminService.reports.entities$,
		};

		this.http.globalReload$
			.pipe(
				switchMap(() => {
					return this.currentView$.asObservable();
				}),
				takeUntil(this.destroy$)
			)
			.subscribe((view: string) => {
				this.destroyPassClick.next();
				this.allData = [];
				if (view === 'pass_search') {
					this.isCheckbox$.next(true);
					this.adminCalendarOptions = {
						rangeId: 'range_6',
						toggleResult: 'Range',
					};
					this.passSearchData = {
						selectedStudents: null,
						selectedDestinationRooms: null,
						selectedOriginRooms: null,
						selectedDate: {
							start: moment('1/8/' + (moment().year() - 1), 'DD/MM/YYYY'),
							end: moment(moment(), 'DD/MM/YYYY'),
						},
						onlyEnded: true,
					};
					this.search(300);
					return this.hallPassService.passesLoaded$;
				} else if (view === 'contact_trace') {
					this.isCheckbox$.next(true);
					this.showContactTraceTable = false;
					this.clearContactTraceData();
					this.adminCalendarOptions = {
						rangeId: 'range_6',
						toggleResult: 'Range',
					};
					// this.adminCalendarOptions = null;
					this.contactTraceData = {
						selectedStudents: null,
						selectedDate: {
							start: moment('1/8/' + (moment().year() - 1), 'DD/MM/YYYY'),
							end: moment(moment(), 'DD/MM/YYYY'),
						},
					};
					this.cdr.detectChanges();
					return this.contactTraceService.contactTraceLoaded$;
				} else if (view === 'report_search') {
					this.adminCalendarOptions = {
						rangeId: 'range_6',
						toggleResult: 'Range',
					};
					this.isCheckbox$.next(false);
					this.reportSearchData = {
						selectedStudents: null,
						selectedDate: {
							start: moment('1/8/' + (moment().year() - 1), 'DD/MM/YYYY'),
							end: moment(moment(), 'DD/MM/YYYY'),
						},
						selectedStatus: null,
						selectedTeachers: null,
					};
					this.searchReports();
				} else if (view === 'encounter_detection') {
					this.isCheckbox$.next(false);
					this.encounterDetectedData = {
						selectedStudents: null,
						selectedDate: null,
					};

					if (this.userService.getFeatureEncounterDetection()) {
						this.searchEncounterDetection();
					}

					return this.encounterDetectionService.encounterLoading$.pipe(map((loading) => !loading));
				}
			});

		this.searchedPassData$ = this.hallPassService.passesCollection$.pipe(
			filter((res: any[]) => this.currentView$.getValue() === 'pass_search'),
			map((passes: HallPass[]) => {
				const getColumns = this.storage.getItem(`order${this.currentView$.getValue()}`);
				const columns = {};
				if (getColumns) {
					const columnsOrder = ('Pass,' + getColumns).split(',');
					for (let i = 0; i < columnsOrder.length; i++) {
						Object.assign(columns, { [columnsOrder[i]]: null });
					}
					this.currentColumns = cloneDeep(columns);
				}
				if (!passes.length) {
					this.passSearchState.isEmpty = true;
					return getColumns
						? [this.currentColumns]
						: [
								{
									Pass: null,
									'Student Name': null,
									Grade: null,
									ID: null,
									Origin: null,
									Destination: null,
									'Pass start time': null,
									Duration: null,
								},
						  ];
				}
				this.passSearchState.isEmpty = false;
				const response = passes.map((pass) => {
					const diff = moment(pass.end_time).diff(moment(pass.start_time));
					let minutes = moment.duration(diff).minutes();
					if (minutes < 0) {
						minutes = 0;
					}
					const hours = moment.duration(diff).hours();
					if (hours > 0) {
						minutes = minutes * 60;
					}
					let seconds = moment.duration(diff).seconds();
					if (seconds < 0) {
						seconds = 0;
					}
					const duration = `${minutes}` + (seconds === 0 ? ' min' : `:${seconds < 10 ? '0' + seconds : seconds} min`);
					const passImg = this.domSanitizer.bypassSecurityTrustHtml(`<div class="pass-icon" style="background: ${this.getGradient(
						pass.gradient_color
					)}; cursor: pointer">
<!--                                 <img *ngIf="${pass.icon}" width="15" src="${pass.icon}" alt="Icon">-->
                              </div>`);
					let rawObj: any = {
						Pass: passImg,
						'Student Name': pass.student.display_name,
						Grade: pass.student.grade_level
							? this.domSanitizer.bypassSecurityTrustHtml(`<span class="grade-level">${pass.student.grade_level}</span>`)
							: '-',
						ID: pass.student.custom_id ? this.domSanitizer.bypassSecurityTrustHtml(`<span class="id-number">${pass.student.custom_id}</span>`) : '-',
						Origin: pass.origin.title,
						Destination: pass.destination.title,
						'Pass start time': moment(pass.start_time).format('M/DD h:mm A'),
						Duration: duration,
					};

					const currentObj = {};
					if (this.storage.getItem(`order${this.currentView$.getValue()}`)) {
						Object.keys(this.currentColumns).forEach((key) => {
							currentObj[key] = rawObj[key];
						});
					}

					rawObj = this.storage.getItem(`order${this.currentView$.getValue()}`) ? currentObj : rawObj;

					Object.defineProperty(rawObj, 'id', { enumerable: false, value: pass.id });
					Object.defineProperty(rawObj, 'date', { enumerable: false, value: moment(pass.created) });
					Object.defineProperty(rawObj, 'travelType', { enumerable: false, value: pass.travel_type });
					Object.defineProperty(rawObj, 'email', { enumerable: false, value: pass.student.primary_email });

					return rawObj;
				});

				// every search disable UI downloading button
				// here we enable it back
				this.disabled = false;

				this.allData = response;
				return response;
			})
		);

		this.encounterDetectionData$ = this.encounterDetectionService.encounteDetection$.pipe(
			filter((res: any) => this.currentView$.getValue() === 'encounter_detection'),
			map((encounterDetection: EncounterDetection[]) => {
				if (!encounterDetection?.length) {
					this.encounterDetectedState.isEmpty = true;
					return [
						{
							Students: null,
							'# of Encounters': null,
							Passes: null,
						},
					];
				}

				this.encounterDetectedState.isEmpty = false;
				const response = encounterDetection.map((encounter, index) => {
					const passImg = this.createPasses(encounter.encounters);
					const DEFAULTAVATAR = "'./assets/Avatar Default.svg' | resolveAsset";
					const students = `<div class="ds-flex-center-start">
                  <div class="ds-flex-center-start name-wrapper"><img src=${
										encounter.firstStudent.profile_picture ?? DEFAULTAVATAR
									} alt="First student picture"><p class="student-name">${encounter.firstStudent.display_name}</p></div>
                  <div class="ds-flex-center-start name-wrapper"><img src=${
										encounter.secondStudent.profile_picture ?? DEFAULTAVATAR
									} alt="Second student picture"><p class="student-name">${encounter.secondStudent.display_name}</p></div>
              </div>`;
					const rawObj: any = {
						Students: students,
						'# of Encounters': encounter.numberOfEncounters,
						Passes: passImg,
					};

					// const currentObj = {};
					// if (this.storage.getItem(`order${this.currentView$.getValue()}`)) {
					//   Object.keys(this.currentColumns).forEach(key => {
					//     currentObj[key] = rawObj[key];
					//   });
					// }

					// rawObj = this.storage.getItem(`order${this.currentView$.getValue()}`) ? currentObj : rawObj;
					Object.defineProperty(rawObj, 'id', { enumerable: false, value: index });
					Object.defineProperty(rawObj, 'encounters', { enumerable: false, value: encounter.encounters });
					Object.defineProperty(rawObj, 'firstStudent', { enumerable: false, value: encounter.firstStudent });
					Object.defineProperty(rawObj, 'secondStudent', { enumerable: false, value: encounter.secondStudent });

					return rawObj;
				});
				this.allData = response;
				return response;
			})
		);

		this.encounterDetectionCreatedAt$ = this.encounterDetectionService.encounterCreatedAt$.pipe(
			filter((res: any) => this.currentView$.getValue() === 'encounter_detection'),
			map((createdAt: Date | null) => {
				if (!createdAt) {
					return '';
				}
				return moment(createdAt).calendar();
			})
		);

		this.contactTraceData$ = this.contactTraceService.contactTraceData$.pipe(
			filter(() => this.currentView$.getValue() === 'contact_trace'),
			map((contacts: ContactTrace[]) => {
				if (!contacts.length) {
					this.contactTraceState.isEmpty = true;
					return [
						{
							'Student Name': null,
							Grade: null,
							ID: null,
							Degree: null,
							'Contact connection': null,
							'Contact date': null,
							Duration: null,
							Passes: null,
						},
					];
				}
				this.contactTraceState.isEmpty = false;
				this.contact_trace_passes = {};
				const response = contacts.map((contact) => {
					const duration = moment.duration(contact.total_contact_duration, 'seconds');
					const connection: any[] =
						contact.contact_paths.length === 2 && isEqual(contact.contact_paths[0], contact.contact_paths[1])
							? [contact.contact_paths[0]]
							: contact.contact_paths.length === 4 &&
							  isEqual(contact.contact_paths[0], contact.contact_paths[1]) &&
							  isEqual(contact.contact_paths[2], contact.contact_paths[3])
							? [contact.contact_paths[0], contact.contact_paths[2]]
							: contact.contact_paths;

					const result = {
						'Student Name': contact.student.display_name,
						Grade: contact.student.grade_level
							? this.domSanitizer.bypassSecurityTrustHtml(`<span class="grade-level">${contact.student.grade_level}</span>`)
							: '-',
						ID: contact.student.custom_id
							? this.domSanitizer.bypassSecurityTrustHtml(`<span class="id-number">${contact.student.custom_id}</span>`)
							: '-',
						Degree: contact.degree,
						'Contact connection': this.domSanitizer.bypassSecurityTrustHtml(
							`<div class="no-wrap" style="display: flex; width: 300px !important;">` +
								connection
									.map((path) => {
										if (path.length === 1) {
											return `<span style="margin-left: 5px">${path[0].display_name}</span>`;
										} else {
											return `<span style="margin-left: 5px">${path[0].display_name + ' to ' + path[1].display_name}</span>`;
										}
									})
									.join() +
								`</div>`
						),
						'Contact date': moment(contact.initial_contact_date).format('M/DD h:mm A'),
						Duration:
							moment(Number.isInteger(duration.asMilliseconds()) ? duration.asMilliseconds() : duration.asMilliseconds()).format('mm:ss') + ' min',
						Passes: this.domSanitizer.bypassSecurityTrustHtml(
							`<div style="display: flex">` +
								contact.contact_passes
									.map(({ contact_pass, student_pass }, index) => {
										this.contact_trace_passes = {
											...this.contact_trace_passes,
											[contact_pass.id]: contact_pass,
											[student_pass.id]: student_pass,
										};
										return `<div style="display: flex; ${index > 0 ? 'margin-left: 5px' : ''}">
                            <div class="pass-icon" onClick="passClick(${contact_pass.id})" style="background: ${this.getGradient(
											contact_pass.gradient_color
										)}; cursor: pointer"></div>
                            <div class="pass-icon" onClick="passClick(${student_pass.id})" style="background: ${this.getGradient(
											student_pass.gradient_color
										)}; margin-left: 5px; cursor: pointer"></div>
                        </div>`;
									})
									.join('') +
								`</div>`
						),
					};

					Object.defineProperty(result, 'id', { enumerable: false, value: contact.contact_passes[0].contact_pass.id });
					Object.defineProperty(result, 'date', { enumerable: false, value: moment(contact.initial_contact_date) });

					return result;
				});
				this.allData = response;
				return response;
			})
		);

		this.reportsSearchData$ = this.adminService.reports.reports$.pipe(
			filter((res) => this.currentView$.getValue() === 'report_search'),
			map((reports: Report[]) => {
				if (!reports.length) {
					this.reportSearchState.isEmpty = true;
					return [
						{
							'Student Name': null,
							Grade: null,
							ID: null,
							Message: null,
							Status: null,
							Pass: null,
							'Submitted by': null,
							'Date submitted': null,
						},
					];
				}
				this.reportSearchState.isEmpty = false;
				return reports.map((report) => {
					const data = report as any;
					const _passTile =
						data?.reported_pass?.gradient_color && data?.reported_pass?.id
							? `<div class="pass-icon" onClick="reportedPassClick(${data.reported_pass.id})" style="background: ${this.getGradient(
									data.reported_pass.gradient_color
							  )}; cursor: pointer">`
							: '';
					const passTile = this.domSanitizer.bypassSecurityTrustHtml(_passTile);
					const result = {
						'Student Name': this.domSanitizer.bypassSecurityTrustHtml(`<div>${report.student.display_name}</div>`),
						Grade: report.student.grade_level
							? this.domSanitizer.bypassSecurityTrustHtml(`<span class="grade-level">${report.student.grade_level}</span>`)
							: '-',
						ID: report.student.custom_id
							? this.domSanitizer.bypassSecurityTrustHtml(`<span class="id-number">${report.student.custom_id}</span>`)
							: '-',
						Message: this.domSanitizer.bypassSecurityTrustHtml(`<div><div class="message">${report.message || 'No report message'}</div></div>`),
						Status: report.status,
						Pass: passTile,
						'Submitted by': this.domSanitizer.bypassSecurityTrustHtml(`<div>${report.issuer.display_name}</div>`),
						'Date submitted': this.domSanitizer.bypassSecurityTrustHtml(`<div>${moment(report.created).format('MM/DD hh:mm A')}</div>`),
					};

					Object.defineProperty(result, 'id', { enumerable: false, value: report.id });

					return result;
				});
			})
		);

		this.tableService.selectRow
			.asObservable()
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				this.selectedRows = res;
			});

		// count passes emits on a new search thata assumes any previous selection is cleared
		this.passSearchState.countPasses$.subscribe((_) => this.clearTableSelection());
	}

	createPasses(encounters) {
		encounters.sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime());
		let passess = '<div class="ds-flex-center-start">';
		for (let i = 0; i < encounters.length; i++) {
			const element = encounters[i];

			const passImg = `<div class="pass-icon" style="background: ${this.getGradient(element.firstStudentPass.gradient_color)}; cursor: pointer">
                                        </div><div class="pass-icon" style="background: ${this.getGradient(
																					element.secondStudentPass.gradient_color
																				)}; cursor: pointer">
                                        </div>`;
			passess += passImg;
		}
		return this.domSanitizer.bypassSecurityTrustHtml(`${passess}</div>`);
	}

	getCountAccounts(count: TotalAccounts) {
		return count.student_count;
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		this.destroyPassClick.next();
		this.destroyPassClick.complete();
		this.clickEventSubscription.unsubscribe();
	}

	getGradient(gradient: string) {
		const colors = gradient.split(',');
		return 'radial-gradient(circle at 73% 71%, ' + colors[0] + ', ' + colors[1] + ')';
	}

	openConsentDeletePasses(event: Event) {
		const ActionPassDeletion = 'deletePasses';

		const deletePasses = {
			display: this.selectedRows.length > 1 ? 'Delete passes' : 'Delete the pass',
			color: '#E32C66', // $red500
			action: ActionPassDeletion,
			icon: './assets/Delete (Red).svg',
		};
		const consent = this.dialog.open(ConsentMenuComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: new ElementRef(event.currentTarget),
				options: [deletePasses],
			},
		});

		consent.afterClosed().subscribe((action: string | undefined) => {
			if (action === undefined || action !== ActionPassDeletion) {
				this.clearTableSelection();
				return;
			}

			const num = this.selectedRows.length;
			const headerText = num === 1 ? 'Delete the pass ?' : `Delete ${num} passes ?`;
			const detailText = `You are about to delete ${num} ${num === 1 ? 'pass' : 'passes'}. Deleted records can\'t be restored after 90 days.`;

			// open dialog to "after 90 days deletion"
			this.dialog
				.open(ConfirmationDialogComponent, {
					...RecommendedDialogConfig,
					data: {
						headerText,
						buttons: {
							confirmText: 'Delete',
							denyText: 'Cancel',
						},
						body: null,
						templateData: { detailText },
					} as ConfirmationTemplates,
				})
				.afterClosed()
				.subscribe((choice: boolean | undefined) => {
					if (!choice) {
						return this.clearTableSelection();
					}
					const data: any = {};
					data['removed'] = true;
					data['ids'] = this.selectedRows.map((s) => +s.id);
					const replacedRows = this.passtable.dataSource.allData.map((s) => {
						// a soon to be deleted case?
						if (data['ids'].includes(+s.id)) {
							return this.passtable.generateOneFakeData();
						}
						// just keep the old row
						return { ...s };
					});
					// keep original data
					const originalRows = [...this.passtable.dataSource.allData];
					// replace soon to be deleted rows with fake rows
					this.passtable.dataSource.setFakeData([...replacedRows]);
					this.hallPassService
						.hidePasses(data)
						.pipe(
							tap((r: PassRemovedResponse) => {
								if (!('dids' in r)) {
									throw new Error('missing in data shape');
								}

								this.passtable.dataSource.allData = originalRows.filter((s) => !r.dids.includes(+s.id));
								// just update the totalCOunt and lastAddedPasses
								this.hallPassService.changePassesCollection(r.dids);
								this.clearTableSelection();
							}),
							takeUntil(this.destroy$),
							retryWhen((errors: Observable<HttpErrorResponse>) =>
								errors.pipe(
									// deal with errors secquentially
									concatMap((e: HttpErrorResponse, i: number) =>
										iif(
											() => {
												const s: number = +e.status;
												// error is related to the client
												// so do not retry, jump directly to the toast
												if (s >= 400 && s < 500) {
													return true;
												}
												// only server errors have to be retried for more times
												// as they can dissapear meanwhile
												return i > 1;
											}, // after 1 original try + 2 retries shows a toast
											of(e).pipe(
												take(1),
												tap((e) => {
													const message: string = !!e?.error ? e.error.detail ?? e.error.message ?? e.message : e.message;
													// progress-interceptor have hall_pass as excepted url
													// so it will not catch any error thrown under hall_pass urls
													// notify the admin is how we deal with this kind of error
													this.toastService.openToast({
														title: `${message}`,
														subtitle: `Trying ${i + 1} times but did not succeed to remove the passes`,
														type: 'error',
														showButton: false,
													});
													// throw a special error that dies silently
													const eo = <OverflownTries>e;
													eo.overflown = true;
													throw eo;
												})
											),
											of(e).pipe(
												delay(300),
												tap((e) => console.log(`retrying ${e.message}`))
											)
										)
									)
								)
							),

							catchError((e) => {
								// discard fake rows
								this.passtable.dataSource.allData = originalRows;
								// an OverflownTries error has been dealt with it above
								if ('overflown' in e) {
									return of(null);
								}
								// other errors are thrown
								throw e;
							})
						)
						.subscribe();
				});
		});
	}

	clearTableSelection() {
		this.tableService.clearSelectedUsers.next(true);
		this.selectedRows = [];
	}

	passClick(id) {
		iif(
			() => ['pass_search'].includes(this.currentView$.getValue()),
			this.hallPassService.passesEntities$.pipe(take(1)),
			of(this.contact_trace_passes)
		)
			.pipe(
				takeUntil(this.destroyPassClick),
				map((passes) => {
					return passes[id];
				})
			)
			.subscribe((pass) => {
				pass.start_time = new Date(pass.start_time);
				pass.end_time = new Date(pass.end_time);
				const data = {
					pass: pass,
					fromPast: true,
					forFuture: false,
					forMonitor: false,
					isActive: false,
					forStaff: true,
				};
				this.dialog.open(PassCardComponent, {
					panelClass: 'search-pass-card-dialog-container',
					backdropClass: 'custom-bd',
					data: data,
				});
			});
	}

	encounterClick(encounte_data) {
		this.dialog.open(EncounterDetectionDialogComponent, {
			panelClass: 'accounts-profiles-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '500px',
			data: { encounte_data: encounte_data },
		});
	}

	openFilter(event: HTMLElement, action: string) {
		UNANIMATED_CONTAINER.next(true);
		if (action === 'students' || action === 'destination' || action === 'origin') {
			const studentFilter = this.dialog.open(StudentFilterComponent, {
				id: `${action}_filter`,
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: {
					trigger: new ElementRef(event).nativeElement,
					selectedStudents:
						this.currentView$.getValue() === 'pass_search'
							? this.passSearchData.selectedStudents
							: this.currentView$.getValue() === 'report_search'
							? this.reportSearchData.selectedStudents
							: this.currentView$.getValue() === 'encounter_detection'
							? this.encounterDetectedData.selectedStudents
							: this.contactTraceData.selectedStudents,
					type: action === 'students' ? 'selectedStudents' : 'rooms',
					rooms:
						this.currentView$.getValue() === 'pass_search'
							? action === 'origin'
								? this.passSearchData.selectedOriginRooms
								: this.passSearchData.selectedDestinationRooms
							: this.contactTraceData.selectedDestinationRooms,
					multiSelect:
						this.currentView$.getValue() === 'pass_search' ||
						this.currentView$.getValue() === 'report_search' ||
						this.currentView$.getValue() === 'encounter_detection',
				},
			});

			studentFilter
				.afterClosed()
				.pipe(
					tap(() => UNANIMATED_CONTAINER.next(false)),
					filter((res) => res)
				)
				.subscribe(({ students, type }) => {
					if (type === 'rooms') {
						if (action === 'origin') {
							this.passSearchData.selectedOriginRooms = students;
						} else if (action === 'destination') {
							this.passSearchData.selectedDestinationRooms = students;
						}
					} else if (type === 'selectedStudents') {
						if (this.currentView$.getValue() === 'pass_search') {
							this.passSearchData.selectedStudents = students;
						} else if (this.currentView$.getValue() === 'report_search') {
							this.reportSearchData.selectedStudents = students;
						} else if (this.currentView$.getValue() === 'encounter_detection') {
							this.encounterDetectedData.selectedStudents = students;
						} else {
							this.contactTraceData.selectedStudents = students;
						}
					}
					if (
						this.isSearched ||
						this.currentView$.getValue() === 'contact_trace' ||
						this.currentView$.getValue() === 'report_search' ||
						this.currentView$.getValue() === 'encounter_detection'
					) {
						this.autoSearch();
					}
					this.cdr.detectChanges();
				});
		} else if (action === 'teachers') {
			const teacherFilter = this.dialog.open(StudentFilterComponent, {
				id: `${action}_filter`,
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: {
					trigger: new ElementRef(event).nativeElement,
					selectedTeachers: this.reportSearchData.selectedTeachers,
					type: 'selectedTeachers',
					multiSelect: true,
				},
			});

			teacherFilter
				.afterClosed()
				.pipe(
					tap(() => UNANIMATED_CONTAINER.next(false)),
					filter((res) => res)
				)
				.subscribe(({ students, type }) => {
					this.reportSearchData.selectedTeachers = students;
					this.autoSearch();
					this.cdr.detectChanges();
				});
		} else if (action === 'status') {
			const statusFilter = this.dialog.open(StatusFilterComponent, {
				id: `${action}_filter`,
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: {
					trigger: new ElementRef(event).nativeElement,
					selectedStatus: this.reportSearchData.selectedStatus,
					type: 'selectedStatus',
				},
			});

			statusFilter
				.afterClosed()
				.pipe(
					tap(() => UNANIMATED_CONTAINER.next(false)),
					filter((res) => res)
				)
				.subscribe(({ status, type }) => {
					this.reportSearchData.selectedStatus = status;
					this.autoSearch();
					this.cdr.detectChanges();
				});
		} else if (action === 'calendar') {
			const calendar = this.dialog.open(DateTimeFilterComponent, {
				id: 'calendar_filter',
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: {
					target: new ElementRef(event),
					date:
						this.currentView$.getValue() === 'pass_search'
							? this.passSearchData.selectedDate
							: this.currentView$.getValue() === 'report_search'
							? this.reportSearchData.selectedDate
							: this.currentView$.getValue() === 'encounter_detection'
							? this.encounterDetectedData.selectedDate
							: this.contactTraceData.selectedDate,
					options: this.adminCalendarOptions,
				},
			});

			calendar
				.afterClosed()
				.pipe(
					tap(() => UNANIMATED_CONTAINER.next(false)),
					filter((res) => res)
				)
				.subscribe(({ date, options }) => {
					this.adminCalendarOptions = options;
					if (this.currentView$.getValue() === 'pass_search') {
						if (!date.start) {
							this.passSearchData.selectedDate = { start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes') };
						} else {
							this.passSearchData.selectedDate = { start: date.start.startOf('day'), end: date.end.endOf('day') };
						}
					} else if (this.currentView$.getValue() === 'contact_trace') {
						if (!date.start) {
							this.contactTraceData.selectedDate = { start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes') };
						} else {
							this.contactTraceData.selectedDate = { start: date.start.startOf('day'), end: date.end.endOf('day') };
						}
					} else if (this.currentView$.getValue() === 'report_search') {
						if (!date.start) {
							this.reportSearchData.selectedDate = { start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes') };
						} else {
							this.reportSearchData.selectedDate = { start: date.start.startOf('day'), end: date.end.endOf('day') };
						}
					} else if (this.currentView$.getValue() === 'encounter_detection') {
						if (!date.start) {
							this.encounterDetectedData.selectedDate = { start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes') };
						} else {
							this.encounterDetectedData.selectedDate = { start: date.start.startOf('day'), end: date.end.endOf('day') };
						}
					}
					if (
						this.isSearched ||
						this.currentView$.getValue() === 'contact_trace' ||
						this.currentView$.getValue() === 'report_search' ||
						this.currentView$.getValue() === 'encounter_detection'
					) {
						this.autoSearch();
					}
					this.cdr.detectChanges();
				});
		}
	}

	loadMorePasses() {
		this.hallPassService.getMorePasses();
	}

	loadMoreReports() {
		this.adminService.getMoreReports();
	}

	checkQueryParams() {
		if (!this.passSearchData.selectedStudents) {
			delete this.queryParams['student'];
		}
		if (!this.passSearchData.selectedDestinationRooms) {
			delete this.queryParams['destination'];
		}
		if (!this.passSearchData.selectedOriginRooms) {
			delete this.queryParams['origin'];
		}
		if (this.passSearchData.selectedDate) {
			delete this.queryParams['created_after'];
			delete this.queryParams['end_time_before'];
		}
	}

	autoSearch() {
		if (this.currentView$.getValue() === 'pass_search') {
			if (
				!this.passSearchData.selectedDestinationRooms &&
				!this.passSearchData.selectedOriginRooms &&
				!this.passSearchData.selectedDate &&
				!this.passSearchData.selectedStudents
			) {
				this.search(300);
				return;
			}
			if (this.isSearched) {
				this.search();
				return;
			}
		} else if (this.currentView$.getValue() === 'contact_trace' && this.showContactTraceTable) {
			this.contactTraceService.clearContactTraceDataRequest();
			this.showContactTraceTable = false;
			this.contactTraceState.isEmpty = false;
		} else if (this.currentView$.getValue() === 'report_search') {
			this.searchReports();
		} else if (this.currentView$.getValue() === 'encounter_detection') {
			this.searchEncounterDetection();
		}
	}

	search(limit: number = 300) {
		// prevent CSV file downloading while data to be downloaded is not yet here
		this.disabled = true;

		const queryParams: any = {};

		if (this.passSearchData.selectedDestinationRooms) {
			queryParams['destination'] = this.passSearchData.selectedDestinationRooms.map((l) => l['id']);
		}
		if (this.passSearchData.selectedOriginRooms) {
			queryParams['origin'] = this.passSearchData.selectedOriginRooms.map((l) => l['id']);
		}
		if (this.passSearchData.selectedStudents) {
			queryParams['student'] = this.passSearchData.selectedStudents.map((s) => s['id']);
		}
		if (this.passSearchData?.onlyEnded) {
			queryParams['only_ended'] = this.passSearchData.onlyEnded;
		}

		if (this.passSearchData.selectedDate) {
			let start;
			let end;
			if (this.passSearchData.selectedDate['start']) {
				start = this.passSearchData.selectedDate['start'].toISOString();
				queryParams['created_after'] = start;
			}
			if (this.passSearchData.selectedDate['end']) {
				end = this.passSearchData.selectedDate['end'].toISOString();
				queryParams['end_time_before'] = end;
			}
		}
		queryParams['limit'] = limit;
		queryParams['total_count'] = 'true';
		this.queryParams = { ...this.queryParams, ...queryParams };

		const url = constructUrl('v1/hall_passes', this.queryParams);
		this.hallPassService.searchPassesRequest(url);
		this.isSearched = true;
	}

	openPassDialog(pid: number | null, invisBackdrop: boolean | null = false) {
		if (pid === null) {
			return;
		}

		this.reportSearchState.entities$
			.pipe(
				take(1),
				map((rr: Dictionary<Report>): HallPass | null => {
					const filtered = Object.entries(rr).filter(([_, v]) => +v?.reported_pass_id === +pid); // force number equality

					const found = filtered.map(([_, v]) => v?.reported_pass);
					// there can be many more reports for the same pass
					if (found.length >= 1) {
						try {
							// is is expected a HallPass like object
							// as only this kind of pass can be reported
							return found[0] instanceof HallPass ? found[0] : HallPass.fromJSON(found[0]);
						} catch (e) {
							// TODO: how to deal with this error??
							console.log(e);
						}
					}
					return null;
				}),
				takeUntil(this.destroy$)
			)
			.subscribe((pass: HallPass | null) => {
				if (pass === null) {
					return;
				}

				pass.start_time = new Date(pass.start_time);
				pass.end_time = new Date(pass.end_time);
				const data = {
					pass: pass,
					fromPast: true,
					forFuture: false,
					forMonitor: false,
					isActive: false,
					forStaff: true,
				};
				this.dialog.open(PassCardComponent, {
					panelClass: 'search-pass-card-dialog-container',
					backdropClass: invisBackdrop ? 'invis-backdrop' : 'custom-bd',
					data: data,
				});
			});
	}

	searchReports(limit = 100) {
		const queryParams: any = { limit };
		if (this.reportSearchData.selectedStudents) {
			queryParams['student'] = this.reportSearchData.selectedStudents.map((s) => s.id);
		}
		if (this.reportSearchData.selectedTeachers) {
			queryParams['issuer'] = this.reportSearchData.selectedTeachers.map((t) => t.id);
		}
		if (this.reportSearchData.selectedStatus) {
			queryParams['status'] = this.reportSearchData.selectedStatus;
		}
		if (this.reportSearchData.selectedDate) {
			let start;
			let end;
			if (this.reportSearchData.selectedDate['start']) {
				start = this.reportSearchData.selectedDate['start'].toISOString();
				queryParams['created_after'] = start;
			}
			if (this.reportSearchData.selectedDate['end']) {
				end = this.reportSearchData.selectedDate['end'].toISOString();
				queryParams['end_time_before'] = end;
			}
		}
		this.adminService.getReportsData(queryParams);
	}

	searchEncounterDetection() {
		const school = this.http.getSchool();
		const url = `v1/schools/${school.id}/stats/encounter_detection`;
		this.encounterDetectionService.getEncounterDetectionRequest(url);
	}

	contactTrace() {
		this.showContactTraceTable = true;
		this.contactTraceService.getContactsRequest(
			this.contactTraceData.selectedStudents.map((s) => s.id),
			this.contactTraceData.selectedDate['start'].toISOString(),
			this.contactTraceData.selectedDate['end']?.toISOString() ?? new Date().toISOString()
		);
	}

	clearContactTraceData() {
		this.contactTraceService.clearContactTraceDataRequest();
		this.showContactTraceTable = false;
		this.contactTraceState.isEmpty = false;
		this.adminCalendarOptions = null;
		this.contactTraceData = {
			selectedStudents: null,
			selectedDate: null,
		};
	}

	sortHeaders(sortColumn) {
		const queryParams: any = {};
		this.sortColumn = sortColumn;
		this.passSearchState.sortPasses$.pipe(take(1)).subscribe((sort) => {
			switch (sortColumn) {
				case 'Student Name':
					if (this.queryParams.sort === '-student_name') {
						delete queryParams.sort;
						delete this.queryParams.sort;
						break;
					}
					queryParams.sort = sort && sort === 'asc' ? '-student_name' : 'student_name';
					break;
				case 'Origin':
					if (this.queryParams.sort === '-origin_name') {
						delete queryParams.sort;
						delete this.queryParams.sort;
						break;
					}
					queryParams.sort = sort && sort === 'asc' ? '-origin_name' : 'origin_name';
					break;
				case 'Destination':
					if (this.queryParams.sort === '-destination_name') {
						delete queryParams.sort;
						delete this.queryParams.sort;
						break;
					}
					queryParams.sort = sort && sort === 'asc' ? '-destination_name' : 'destination_name';
					break;
				case 'Duration':
					if (this.queryParams.sort === '-duration') {
						delete queryParams.sort;
						delete this.queryParams.sort;
						break;
					}
					queryParams.sort = sort && sort === 'asc' ? '-duration' : 'duration';
					break;
				case 'Pass start time':
					if (this.queryParams.sort === '-start_time') {
						delete queryParams.sort;
						delete this.queryParams.sort;
						break;
					}
					queryParams.sort = sort && sort === 'asc' ? '-start_time' : 'start_time';
			}
			queryParams.limit = 300;
			this.queryParams = { ...this.queryParams, ...queryParams };
			this.hallPassService.sortHallPassesRequest(this.queryParams);
		});
	}

	openInvalidFields() {
		if (!this.contactTraceData.selectedStudents || (!this.contactTraceData.selectedStudents && !this.contactTraceData.selectedDate)) {
			this.buttonForceTrigger$.next('students');
			return;
		} else if (!this.contactTraceData.selectedDate) {
			this.buttonForceTrigger$.next('calendar');
			return;
		}
	}

	disabled: boolean = false;

	exportPasses() {
		// Why unsubscribe manually:
		// -------------------------
		// this method is fired up by button click(s)
		//
		// calling this method once by UI click makes
		// every single UI filter change to trigger a download (creates XLSX file and sends email)
		// worst
		// calling this method repeatedly by UI clicks
		// creates a subscribtion every time
		// and MULTIPLY the unwanted download associated with a single click

		this.disabled = true;

		const unsubscriber = this.adminService
			.exportCsvPasses(this.queryParams)
			.pipe(
				delay(5000),
				switchMap((_) => combineLatest(this.user$, this.passSearchState.countPasses$))
			)
			.subscribe(([user, count]) => {
				this.toastService.openToast({
					title: `${this.numberWithCommas(count)} passes exporting...`,
					subtitle: `In a few minutes, check your email (${user.primary_email}) for a link to download the CSV file.`,
					type: 'success',
					showButton: false,
				});

				unsubscriber.unsubscribe();
				this.disabled = false;
			});
	}

	numberWithCommas(x) {
		return Util.numberWithCommas(x);
	}

	openReportDialog(report: Report) {
		this.reportSearchState.entities$
			.pipe(
				withLatestFrom(this.userService.userData),
				take(1),
				map(([reports, userData]) => {
					return [reports[report.id], userData];
				})
			)
			.subscribe(([selectedReport, userData]) => {
				this.dialog.open(ReportInfoDialogComponent, {
					panelClass: 'overlay-dialog',
					backdropClass: 'custom-bd',
					data: { report: selectedReport, forStaff: true, isAdmin: (userData as User)?.isAdmin() },
				});
			});
	}

	generateCSV() {
		// If we are generating CSV locally, use all data from datasource if no selection.
		let rows: any[];
		if (this.selectedRows.length) {
			rows = this.selectedRows;
		} else {
			rows = this.allData;
		}

		const exceptPass = rows.map((row) => {
			if (row['Contact connection']) {
				const str = row['Contact connection'].changingThisBreaksApplicationSecurity;
				row['Contact connection'] = str.replace(/(<[^>]+>)+/g, '');
			} else {
				row['Email'] = row.email;
				row['Duration'] = row['Duration'].replace(' min', '');
			}

			const $span = document.createElement('span');
			// when we select rows they are not having changingThisBreaksApplicationSecurity
			// but without a selection, mean all rows case, they have changingThisBreaksApplicationSecurity
			// so, we need to test existence of changingThisBreaksApplicationSecurity
			// before to get the value wrapped inside changingThisBreaksApplicationSecurity
			// which we know is in a HTML string, hence the $span trick
			// to let the browser do the work to get a tag-less value of changingThisBreaksApplicationSecurity
			if (row.Grade?.changingThisBreaksApplicationSecurity) {
				$span.innerHTML = row.Grade.changingThisBreaksApplicationSecurity;
				row.Grade = $span.innerText;
			}
			if (row.ID?.changingThisBreaksApplicationSecurity) {
				$span.innerHTML = row.ID.changingThisBreaksApplicationSecurity;
				row.ID = $span.innerText;
			}

			return omit(row, ['Pass', 'Passes']);
		});
		const fileName =
			this.currentView$.getValue() === 'pass_search'
				? 'SmartPass-PassSearch'
				: this.currentView$.getValue() === 'contact_trace'
				? 'SmartPass-ContactTracing'
				: 'TestCSV';

		this.xlsx.generate(exceptPass, fileName);
	}
}
