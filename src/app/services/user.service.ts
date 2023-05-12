import { ErrorHandler, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, merge, Observable, of, race, ReplaySubject, Subject } from 'rxjs';
import { SentryErrorHandler } from '../error-handler';
import { HttpService, ServerAuth } from './http-service';
import { constructUrl } from '../live-data/helpers';
import { Logger } from './logger.service';
import { User } from '../models/User';
import { PollingService } from './polling-service';
import { catchError, concatMap, exhaustMap, filter, map, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Paged } from '../models';
import { RepresentedUser } from '../navbar/navbar.component';
import { Store } from '@ngrx/store';
import { AppState } from '../ngrx/app-state/app-state';
import {
	addUserToProfiles,
	bulkAddAccounts,
	clearCurrentUpdatedAccount,
	getAccounts,
	getMoreAccounts,
	postAccounts,
	removeAccount,
	sortAccounts,
	updateAccountActivity,
	updateAccountPermissions,
	updateAccountPicture,
} from '../ngrx/accounts/actions/accounts.actions';
import {
	getAllAccountsCollection,
	getAllAccountsEntities,
	getCountAllAccounts,
	getLastAddedAllAccounts,
	getLoadedAllAccounts,
	getLoadingAllAccounts,
	getNextRequestAllAccounts,
} from '../ngrx/accounts/nested-states/all-accounts/states/all-accounts-getters.state';
import {
	getAddedAdmin,
	getAdminsAccountsEntities,
	getAdminsCollections,
	getAdminSort,
	getCountAdmins,
	getCurrentUpdatedAdmin,
	getLastAddedAdminsAccounts,
	getLoadedAdminsAccounts,
	getLoadingAdminsAccounts,
	getNextRequestAdminsAccounts,
} from '../ngrx/accounts/nested-states/admins/states/admins.getters.state';
import {
	getAddedTeacher,
	getCountTeachers,
	getCurrentUpdatedTeacher,
	getLastAddedTeachers,
	getLoadedTeachers,
	getLoadingTeachers,
	getNextRequestTeachers,
	getTeacherAccountsCollection,
	getTeachersAccountsEntities,
	getTeacherSort,
} from '../ngrx/accounts/nested-states/teachers/states/teachers-getters.state';
import {
	getAddedAssistant,
	getAssistantsAccountsCollection,
	getAssistantsAccountsEntities,
	getAssistantSort,
	getCountAssistants,
	getCurrentUpdatedAssistant,
	getLastAddedAssistants,
	getLoadedAssistants,
	getLoadingAssistants,
	getNextRequestAssistants,
} from '../ngrx/accounts/nested-states/assistants/states';
import {
	getAddedStudent,
	getCountStudents,
	getCurrentUpdatedStudent,
	getLastAddedStudents,
	getLoadedStudents,
	getLoadingStudents,
	getNextRequestStudents,
	getStudentsAccountsCollection,
	getStudentsAccountsEntities,
	getStudentSort,
	getStudentsStats,
	getStudentsStatsLoaded,
	getStudentsStatsLoading,
} from '../ngrx/accounts/nested-states/students/states';
import { getStudentGroups, postStudentGroup, removeStudentGroup, updateStudentGroup } from '../ngrx/student-groups/actions';
import { StudentList } from '../models/StudentList';
import {
	getCurrentStudentGroup,
	getLoadedGroups,
	getLoadingGroups,
	getStudentGroupsCollection,
} from '../ngrx/student-groups/states/groups-getters.state';
import { getCurrentUpdatedUser, getLoadedUser, getNuxDates, getSelectUserPin, getUserData } from '../ngrx/user/states/user-getters.state';
import { clearUser, getNuxAction, getUser, getUserPinAction, updateUserAction } from '../ngrx/user/actions';
import { addRepresentedUserAction, removeRepresentedUserAction } from '../ngrx/accounts/nested-states/assistants/actions';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
	getIntros,
	updateIntros,
	updateIntrosAdminPassLimitsMessage,
	updateIntrosDisableRoom,
	updateIntrosEncounter,
	updateIntrosHelpCenter,
	updateIntrosMain,
	updateIntrosPassLimitsOnlyCertainRooms,
	updateIntrosSearch,
	updateIntrosSeenReferralNux,
	updateIntrosSeenReferralSuccessNux,
	updateIntrosSeenRenewalStatusPage,
	updateIntrosStudentPassLimits,
	updateIntrosWaitInLine,
} from '../ngrx/intros/actions';
import { getIntrosData, IntroData } from '../ngrx/intros/state';
import { getSchoolsFailure } from '../ngrx/schools/actions';
import { clearRUsers, getRUsers, updateEffectiveUser } from '../ngrx/represented-users/actions';
import { getEffectiveUser, getRepresentedUsersCollections } from '../ngrx/represented-users/states';
import {
	clearProfilePicturesUploadErrors,
	clearUploadedData,
	createUploadGroup,
	deleteProfilePicture,
	getMissingProfilePictures,
	getProfilePicturesUploadedGroups,
	getUploadedErrors,
	postProfilePictures,
	putUploadErrors,
} from '../ngrx/profile-pictures/actions';
import {
	getCurrentUploadedGroup,
	getLastUploadedGroup,
	getMissingProfiles,
	getProfilePicturesLoaded,
	getProfilePicturesLoaderPercent,
	getProfilePicturesLoading,
	getProfiles,
	getUploadedGroups,
	getUploadErrors,
} from '../ngrx/profile-pictures/states';
import { updateTeacherLocations } from '../ngrx/accounts/nested-states/teachers/actions';
import { ProfilePicturesUploadGroup } from '../models/ProfilePicturesUploadGroup';
import { ProfilePicturesError } from '../models/ProfilePicturesError';
import { LoginService } from './login.service';
import { School } from '../models/School';
import { UserStats } from '../models/UserStats';
import { getStudentStats } from '../ngrx/accounts/nested-states/students/actions';
import {
	getAddedParent,
	getCountParents,
	getCurrentUpdatedParent,
	getLastAddedParents,
	getLoadedParents,
	getLoadingParents,
	getNextRequestParents,
	getParentsAccountsCollection,
	getParentsAccountsEntities,
	getParentSort,
} from '../ngrx/accounts/nested-states/parents/states';
import { RenewalStatus } from './admin.service';

export type ProfileStatus = 'disabled' | 'suspended' | 'active';

@Injectable({
	providedIn: 'root',
})
export class UserService implements OnDestroy {
	public userData: ReplaySubject<User> = new ReplaySubject<User>(1);

	/**
	 * Used for acting on behalf of some teacher by his assistant
	 */
	public effectiveUser: Observable<RepresentedUser> = this.store.select(getEffectiveUser);
	public representedUsers: Observable<RepresentedUser[]> = this.store.select(getRepresentedUsersCollections);

	/**
	 * Accounts from store
	 */
	accounts = {
		allAccounts: this.store.select(getAllAccountsCollection),
		adminAccounts: this.store.select(getAdminsCollections),
		teacherAccounts: this.store.select(getTeacherAccountsCollection),
		assistantAccounts: this.store.select(getAssistantsAccountsCollection),
		studentAccounts: this.store.select(getStudentsAccountsCollection),
		parentAccounts: this.store.select(getParentsAccountsCollection),
	};

	countAccounts$ = {
		_all: this.store.select(getCountAllAccounts),
		_profile_admin: this.store.select(getCountAdmins),
		_profile_student: this.store.select(getCountStudents),
		_profile_teacher: this.store.select(getCountTeachers),
		_profile_assistant: this.store.select(getCountAssistants),
		_profile_parent: this.store.select(getCountParents),
	};

	accountsEntities = {
		_all: this.store.select(getAllAccountsEntities),
		_profile_admin: this.store.select(getAdminsAccountsEntities),
		_profile_teacher: this.store.select(getTeachersAccountsEntities),
		_profile_student: this.store.select(getStudentsAccountsEntities),
		_profile_assistant: this.store.select(getAssistantsAccountsEntities),
		_profile_parent: this.store.select(getParentsAccountsEntities),
	};

	isLoadedAccounts$ = {
		all: this.store.select(getLoadedAllAccounts),
		admin: this.store.select(getLoadedAdminsAccounts),
		teacher: this.store.select(getLoadedTeachers),
		student: this.store.select(getLoadedStudents),
		assistant: this.store.select(getLoadedAssistants),
		parent: this.store.select(getLoadedParents),
	};

	isLoadingAccounts$ = {
		all: this.store.select(getLoadingAllAccounts),
		admin: this.store.select(getLoadingAdminsAccounts),
		teacher: this.store.select(getLoadingTeachers),
		student: this.store.select(getLoadingStudents),
		assistant: this.store.select(getLoadingAssistants),
		parent: this.store.select(getLoadingParents),
	};

	lastAddedAccounts$ = {
		_all: this.store.select(getLastAddedAllAccounts),
		_profile_student: this.store.select(getLastAddedStudents),
		_profile_teacher: this.store.select(getLastAddedTeachers),
		_profile_admin: this.store.select(getLastAddedAdminsAccounts),
		_profile_assistant: this.store.select(getLastAddedAssistants),
		_profile_parent: this.store.select(getLastAddedParents),
	};

	nextRequests$ = {
		_all: this.store.select(getNextRequestAllAccounts),
		_profile_student: this.store.select(getNextRequestStudents),
		_profile_teacher: this.store.select(getNextRequestTeachers),
		_profile_admin: this.store.select(getNextRequestAdminsAccounts),
		_profile_assistant: this.store.select(getNextRequestAssistants),
		_profile_parent: this.store.select(getNextRequestParents),
	};

	accountSort$ = {
		_profile_admin: this.store.select(getAdminSort),
		_profile_teacher: this.store.select(getTeacherSort),
		_profile_student: this.store.select(getStudentSort),
		_profile_assistant: this.store.select(getAssistantSort),
		_profile_parent: this.store.select(getParentSort),
	};

	addedAccount$ = {
		_profile_admin: this.store.select(getAddedAdmin),
		_profile_teacher: this.store.select(getAddedTeacher),
		_profile_student: this.store.select(getAddedStudent),
		_profile_assistant: this.store.select(getAddedAssistant),
		_profile_parent: this.store.select(getAddedParent),
	};

	currentUpdatedAccount$ = {
		_profile_admin: this.store.select(getCurrentUpdatedAdmin),
		_profile_teacher: this.store.select(getCurrentUpdatedTeacher),
		_profile_student: this.store.select(getCurrentUpdatedStudent),
		_profile_assistant: this.store.select(getCurrentUpdatedAssistant),
		_profile_parent: this.store.select(getCurrentUpdatedParent),
	};

	/**
	 * Current User
	 */
	user$: Observable<User> = this.store.select(getUserData);
	userPin$: Observable<string | number> = this.store.select(getSelectUserPin);
	loadedUser$: Observable<boolean> = this.store.select(getLoadedUser);
	currentUpdatedUser$: Observable<User> = this.store.select(getCurrentUpdatedUser).pipe(
		map((u) => {
			try {
				return User.fromJSON(u);
			} catch {
				return u;
			}
		})
	);

	/**
	 * Student Groups
	 */
	studentGroups$: Observable<StudentList[]> = this.store.select(getStudentGroupsCollection);
	currentStudentGroup$: Observable<StudentList> = this.store.select(getCurrentStudentGroup);
	isLoadingStudentGroups$: Observable<boolean> = this.store.select(getLoadingGroups);
	isLoadedStudentGroups$: Observable<boolean> = this.store.select(getLoadedGroups);
	blockUserPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	/**
	 * Profile Pictures
	 */
	profilePicturesLoading$: Observable<boolean> = this.store.select(getProfilePicturesLoading);
	profilePicturesLoaded$: Observable<boolean> = this.store.select(getProfilePicturesLoaded);
	profiles$: Observable<(User | Error)[]> = this.store.select(getProfiles);
	profilePictureLoaderPercent$: Observable<number> = this.store.select(getProfilePicturesLoaderPercent);
	profilePicturesErrors$: Subject<{ [id: string]: string; error: string }> = new Subject();

	// cancel operation
	profilePicturesErrorCancel$: Subject<{ error: string }> = new Subject();

	uploadedGroups$: Observable<ProfilePicturesUploadGroup[]> = this.store.select(getUploadedGroups);
	currentUploadedGroup$: Observable<ProfilePicturesUploadGroup> = this.store.select(getCurrentUploadedGroup);
	lastUploadedGroup$: Observable<ProfilePicturesUploadGroup> = this.store.select(getLastUploadedGroup);
	missingProfilePictures$: Observable<User[]> = this.store.select(getMissingProfiles);
	profilePicturesUploadErrors$: Observable<ProfilePicturesError[]> = this.store.select(getUploadErrors);

	/**
	 * Students Stats
	 */
	studentsStats$: Observable<{ [id: string]: UserStats }> = this.store.select(getStudentsStats);
	studentsStatsLoading$: Observable<boolean> = this.store.select(getStudentsStatsLoading);
	studentsStatsLoaded$: Observable<boolean> = this.store.select(getStudentsStatsLoaded);

	introsData$: Observable<IntroData> = this.store.select(getIntrosData);

	nuxDates$: Observable<{ id: string; created: Date }[]> = this.store.select(getNuxDates);

	isEnableProfilePictures$: Observable<boolean>;

	schools$: Observable<School[]>;

	destroy$: Subject<any> = new Subject<any>();

	/**
	 * destroyGlobalReload is responsible for destroying HttpService.globalReload$ subscription.
	 * We destroy this when a parent account has logged in because globalReload$ is only triggered when
	 * a school has loaded.
	 * Therefore, when a parent account has logged in, a school will never load and the globalReload$ Subject
	 * will hang forever. This is why we destroy the observable
	 */
	destroyGlobalReload: Subject<any> = new Subject<any>();

	/**
	 * inhibitParentRequest$ is responsible for not calling `/parent/@me when a user that's not a parent account
	 * has logged in.
	 * The BehaviorSubject has a value of true, which means we hold off on calling the parent user info route.
	 * Only when this value receives false, then we call `/parent/@me`.
	 */
	inhibitParentRequest$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

	constructor(
		private http: HttpService,
		private httpClient: HttpClient,
		private pollingService: PollingService,
		private _logging: Logger,
		private errorHandler: ErrorHandler,
		private store: Store<AppState>,
		private loginService: LoginService
	) {
		/**
		 * /v1/schools is always called no matter the type of user that signs in.
		 * As long as the user is authenticated, /v1/schools is called.
		 *
		 * We listen to HttpService.schoolsCollection, this is the NgRx collection of schools.
		 * The first result is always [] since this is the default value while /v1/schools request
		 * is in progress, so we skip this first value
		 *
		 * If the second value that comes in is also an empty array, it means the user that just logged
		 * in is a parent account, since those accounts are not associated with schools.
		 */
		this.loginService.isAuthenticated$
			.pipe(
				filter(Boolean),
				concatMap(() => this.http.schoolsCollection$.pipe(skip(1), take(1)))
			)
			.subscribe({
				next: (schools) => {
					if (schools.length === 0) {
						// logged in user has no associated schools, it must be a parent account.
						// destroy the global reload observable and allow the parent request to continue
						this.destroyGlobalReload.next();
						this.inhibitParentRequest$.next(false);
					} else {
						// logged in user has associated schools, do not call `/parent/@me`
						this.inhibitParentRequest$.next(true);
					}
				},
			});

		/**
		 * This observable is responsible for listening to both the auth status and whether the
		 * parent route is being inhibited.
		 */
		combineLatest([this.loginService.isAuthenticated$, this.inhibitParentRequest$.asObservable()])
			.pipe(
				filter(([isAuth, inhibitParents]) => {
					return !(!isAuth || inhibitParents);
				}),
				concatMap(() => this.http.get<User>('v1/parent/@me')),
				map((account) => {
					account['sync_types'] = [];
					return User.fromJSON(account);
				})
			)
			.subscribe({
				next: (parentAccount) => {
					this.http.effectiveUserId.next(parseInt(parentAccount.id, 10));
					this.userData.next(parentAccount);
				},
			});

		this.schools$ = this.http.schools$;
		this.http.globalReload$
			.pipe(
				takeUntil(this.destroyGlobalReload),
				tap(() => {
					this.http.effectiveUserId.next(null);
					this.clearRepresentedUsers();
					this.getUserRequest();
					this.getNuxRequest();
				}),
				exhaustMap(() => {
					return this.user$.pipe(
						filter(Boolean),
						take(1),
						map((raw) => User.fromJSON(raw))
					);
				}),
				tap((user) => {
					if (user.isAssistant()) {
						this.getUserRepresentedRequest();
					}
				}),
				switchMap((user: User) => {
					this.blockUserPage$.next(false);
					if (user.isAssistant() && !window.location.href.includes('/kioskMode')) {
						return combineLatest(this.representedUsers.pipe(filter((res) => !!res)), this.http.schoolsCollection$).pipe(
							tap(([users, schools]) => {
								if (!users.length && schools.length === 1) {
									this.store.dispatch(getSchoolsFailure({ errorMessage: 'Assistant does`t have teachers' }));
								} else if (!users.length && schools.length > 1) {
									this.blockUserPage$.next(true);
								}
							}),
							filter(([users, schools]) => !!users.length || schools.length > 1),
							map(([users, schools]) => {
								if (users && users.length) {
									this.http.effectiveUserId.next(+users[0].user.id);
								}
								return user;
							})
						);
					} else {
						return of(user);
					}
				}),
				tap((user) => {
					if (user.isTeacher() || user.isAssistant()) {
						this.getUserPinRequest();
					}
				}),
				takeUntil(this.destroy$)
			)
			.subscribe((user) => {
				this.userData.next(user);
			});

		this.isEnableProfilePictures$ = merge(this.http.currentSchool$, this.getCurrentUpdatedSchool$().pipe(filter((s) => !!s))).pipe(
			filter((s) => !!s),
			map((school) => school.profile_pictures_enabled)
		);

		if (errorHandler instanceof SentryErrorHandler) {
			this.userData.pipe(takeUntil(this.destroy$)).subscribe((user) => {
				errorHandler.setUserContext({
					id: user && user.id ? `${user.id}` : 'unknown',
					email: user && user.primary_email ? user.primary_email : 'unknown',
					is_student: user ? user.isStudent() : false,
					is_teacher: user ? user.isTeacher() : false,
					is_admin: user ? user.isAdmin() : false,
				});
			});
		}

		this.pollingService.listen().pipe(takeUntil(this.destroy$)).subscribe(this._logging.debug);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	registerThirdPartyPlugins(user: User, renewalStatus: RenewalStatus = undefined) {
		// const intercomLauncher = document.querySelector<HTMLDivElement>('div.intercom-lightweight-app');
		// if (user.isStudent() && intercomLauncher) {
		//   intercomLauncher.style.display = 'none';
		// } else {
		//   intercomLauncher.style.display = 'block';
		// }
		setTimeout(() => {
			console.log('registering third party plugins');
			const now = new Date();
			const school: School = this.http.getSchool();

			let trialEndDate: Date;
			if (!!school.trial_end_date) {
				const d = new Date(school.trial_end_date);
				// Drop the time so that the date is the same when we call .toDateString()
				trialEndDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
			}

			let accountType = user.sync_types[0] === 'google' ? 'Google' : user.sync_types[0] === 'clever' ? 'Clever' : 'Standard';
			let trialing = !!trialEndDate && trialEndDate > now;
			let trialEndDateStr = !!trialEndDate ? trialEndDate.toDateString() : 'N/A';

			let company = {
				id: school.id,
				name: school.name,
				'Id Card Access': school.feature_flag_digital_id,
				'Plus Access': school.feature_flag_encounter_detection,
				Trialing: trialing,
				'Trial End Date': trialEndDateStr,
			};

			if (!!renewalStatus) {
				company['customer_success_advocate_hubspot_id'] = renewalStatus.customer_success_advocate_hubspot_id;
				company['account_executive_hubspot_id'] = renewalStatus.account_executive_hubspot_id;
				company['billing_coordinator_hubspot_id'] = renewalStatus.billing_coordinator_hubspot_id;
			}

			window['intercomSettings'] = {
				user_id: user.id,
				name: user.display_name,
				email: user.primary_email,
				created: new Date(user.created),
				type: this.getUserType(user),
				status: user.status,
				account_type: accountType,
				first_login_at: user.first_login,
				company: company,
				hide_default_launcher: true,
				custom_launcher_selector: '.open-intercom-btn',
			};
			window['Intercom']('update', { hideDefaultLauncher: true });

			window['posthog'].identify(user.id, {
				name: user.display_name,
				email: user.primary_email,
				created: new Date(user.created),
				type: this.getUserType(user),
				status: user.status,
				account_type: accountType,
				first_login_at: user.first_login,
				school_id: school.id,
				school_name: school.name,
				id_card_access: school.feature_flag_digital_id,
				encounter_detection_access: school.feature_flag_encounter_detection,
				trialing: trialing,
				trial_end_date: trialEndDateStr,
			});
		}, 3000);
	}

	getUserType(user: User): string {
		if (user.isAdmin()) {
			return 'Admin';
		} else if (user.isTeacher()) {
			return 'Teacher';
		} else if (user.isAssistant()) {
			return 'Assistant';
		} else if (user.isStudent()) {
			return 'Student';
		}
		return 'unknown user';
	}

	getLoadingAccounts(role) {
		if (role === '' || role === '_all') {
			return { loading: this.isLoadingAccounts$.all, loaded: this.isLoadedAccounts$.all };
		} else if (role === '_profile_admin') {
			return { loading: this.isLoadingAccounts$.admin, loaded: this.isLoadedAccounts$.admin };
		} else if (role === '_profile_teacher') {
			return { loading: this.isLoadingAccounts$.teacher, loaded: this.isLoadedAccounts$.teacher };
		} else if (role === '_profile_student') {
			return { loading: this.isLoadingAccounts$.student, loaded: this.isLoadedAccounts$.student };
		} else if (role === '_profile_assistant') {
			return { loading: this.isLoadingAccounts$.assistant, loaded: this.isLoadedAccounts$.assistant };
		} else if (role === '_profile_parent') {
			return { loading: this.isLoadingAccounts$.parent, loaded: this.isLoadedAccounts$.parent };
		}
	}

	getAccountsRole(role) {
		if (role === '' || role === '_all') {
			return this.accounts.allAccounts;
		} else if (role === '_profile_admin') {
			return this.accounts.adminAccounts;
		} else if (role === '_profile_teacher') {
			return this.accounts.teacherAccounts;
		} else if (role === '_profile_student') {
			return this.accounts.studentAccounts;
		} else if (role === '_profile_assistant') {
			return this.accounts.assistantAccounts;
		} else if (role === '_profile_parent') {
			return this.accounts.parentAccounts;
		}
	}

	getAccountsEntities(role) {
		return role ? this.accountsEntities[role] : of(null);
	}

	getUserRequest() {
		this.store.dispatch(getUser());
	}

	getUserSchool(): School {
		return this.http.getSchool();
	}

	getFeatureFlagDigitalID(): boolean {
		return this.getUserSchool().feature_flag_digital_id;
	}

	getFeatureEncounterDetection(): boolean {
		return this.getUserSchool().feature_flag_encounter_detection;
	}

	getFeatureFlagParentAccount(): boolean {
		return this.getUserSchool().feature_flag_parent_accounts;
	}

	getFeatureFlagNewAbbreviation(): boolean {
		return this.getUserSchool().feature_flag_new_abbreviation;
	}

	getFeatureFlagReferralProgram(): boolean {
		return this.getUserSchool().feature_flag_referral_program;
	}

	getCurrentUpdatedSchool$(): Observable<School> {
		return this.http.currentUpdateSchool$;
	}

	clearUser() {
		this.store.dispatch(clearUser());
	}

	getUser() {
		return this.http.get<User>('v1/users/@me');
	}

	getUserById(userId) {
		return this.http.get<User>(`v1/users/${userId}`);
	}

	getUserPinRequest() {
		this.store.dispatch(getUserPinAction());
		return this.userPin$;
	}

	getUserPin() {
		return this.http.get('v1/users/@me/pin_info');
	}

	updateUserRequest(user: User, data) {
		this.store.dispatch(updateUserAction({ user, data }));
		return this.currentUpdatedUser$;
	}

	updateUser(userId, data) {
		return this.http.patch(`v1/users/${userId}`, data);
	}

	getIntrosRequest() {
		this.store.dispatch(getIntros());
	}

	getIntros() {
		return this.http.get('v1/intros');
	}

	updateIntrosRequest(intros, device, version) {
		this.store.dispatch(updateIntros({ intros, device, version }));
	}

	updateIntrosMainRequest(intros, device, version) {
		this.store.dispatch(updateIntrosMain({ intros, device, version }));
		return of(null);
	}

	updateIntrosEncounterRequest(intros, device, version) {
		this.store.dispatch(updateIntrosEncounter({ intros, device, version }));
	}

	updateIntrosSearchRequest(intros, device, version) {
		this.store.dispatch(updateIntrosSearch({ intros, device, version }));
	}

	updateIntrosHelpCenterRequest(intros, device, version) {
		this.store.dispatch(updateIntrosHelpCenter({ intros, device, version }));
	}

	updateIntrosDisableRequest(intros, device, version) {
		this.store.dispatch(updateIntrosDisableRoom({ intros, device, version }));
	}

	updateIntrosStudentPassLimitRequest(intros, device, version) {
		this.store.dispatch(updateIntrosStudentPassLimits({ intros, device, version }));
	}

	updateIntrosAdminPassLimitsMessageRequest(intros, device, version) {
		this.store.dispatch(updateIntrosAdminPassLimitsMessage({ intros, device, version }));
	}

	updateIntrosWaitInLineRequest(intros, device, version) {
		this.store.dispatch(updateIntrosWaitInLine({ intros, device, version }));
	}

	updateIntrosPassLimitsOnlyCertainRoomsRequest(intros, device, version) {
		this.store.dispatch(updateIntrosPassLimitsOnlyCertainRooms({ intros, device, version }));
	}

	updateIntrosSeenRenewalStatusPageRequest(intros, device, version) {
		this.store.dispatch(updateIntrosSeenRenewalStatusPage({ intros, device, version }));
	}

	updateIntrosSeenReferralNuxRequest(intros, device, version) {
		this.store.dispatch(updateIntrosSeenReferralNux({ intros, device, version }));
	}

	updateIntrosSeenReferralSuccessNuxRequest(intros, device, version) {
		this.store.dispatch(updateIntrosSeenReferralSuccessNux({ intros, device, version }));
	}

	// TODO: Make all update functions into a single function
	// TODO: Have all update intro endpoints be part of an enum
	// TODO: Share that enum with `intro.effects.ts`

	updateIntros(device, version) {
		return this.http.patch('v1/intros/main_intro', { device, version });
	}

	updateIntrosReferral(device, version) {
		return this.http.patch('v1/intros/referral_reminder', { device, version });
	}

	updateIntrosEncounter(device, version) {
		return this.http.patch('v1/intros/encounter_reminder', { device, version });
	}

	updateIntrosSearch(device, version) {
		return this.http.patch('v1/intros/search_reminder', { device, version });
	}

	updateIntrosHelpCenter(device, version) {
		return this.http.patch('v1/intros/frontend_help_center', { device, version });
	}

	updateIntrosDisableRoom(device, version) {
		return this.http.patch('v1/intros/disable_room_reminder', { device, version });
	}

	updateIntrosStudentPassLimit(device, version) {
		return this.http.patch('v1/intros/student_pass_limit', { device, version });
	}

	updateIntrosAdminPassLimitMessage(device, version) {
		return this.http.patch('v1/intros/admin_pass_limit_message', { device, version });
	}

	updateIntrosWaitInLine(device, version) {
		return this.http.patch(`v1/intros/wait_in_line`, { device, version });
	}

	updateIntrosPassLimitsOnlyCertainRooms(device, version) {
		return this.http.patch(`v1/intros/admin_pass_limits_only_certain_rooms`, { device, version });
	}

	updateIntrosSeenRenewalStatusPage(device, version) {
		return this.http.patch(`v1/intros/seen_renewal_status_page`, { device, version });
	}

	updateIntrosSeenReferralNux(device, version) {
		return this.http.patch(`v1/intros/seen_referral_nux`, { device, version });
	}

	updateIntrosSeenReferralSuccessNux(device, version) {
		return this.http.patch(`v1/intros/seen_referral_success_nux`, { device, version });
	}

	updateIntrosDownloadedYearInReview(device, version) {
		return this.http.patch(`v1/intros/downloaded_year_in_review`, {device, version});
	}

	saveKioskModeLocation(locId): Observable<ServerAuth> {
		return this.http.post('auth/kiosk', { location: locId });
	}

	getUserRepresentedRequest() {
		this.store.dispatch(getRUsers());
	}

	getUserRepresented() {
		return this.http.get<RepresentedUser[]>('v1/users/@me/represented_users');
	}

	sendTestNotification(id) {
		return this.http.post(`v1/users/${id}/test_notification`, new Date());
	}

	searchProfile(role?, limit = 5, search?, ignoreProfileWithStatuses: ProfileStatus[] = ['suspended']) {
		let url: string = 'v1/users?';
		if (role) {
			url += `role=${role}&`;
		}
		if (limit) {
			url += `limit=${limit}&`;
		}
		if (search) {
			url += `search=${search}&`;
		}

		for (const hideStatus of ignoreProfileWithStatuses) {
			url += `hideStatus=${hideStatus}&`;
		}

		if (url[url.length - 1] === '&') {
			url = url.slice(0, -1);
		}

		return this.http.get<Paged<any>>(url);
	}

	possibleProfileById(id: string): Observable<User | null> {
		return this.http.get<User>(`v1/users/${id}`, { headers: { 'X-Ignore-Errors': 'true' } }).pipe(catchError((err) => of(null)));
	}

	searchProfileAll(search, type: string = 'alternative', excludeProfile?: string, gSuiteRoles?: string[]) {
		switch (type) {
			case 'alternative':
				return this.http.get(constructUrl(`v1/users`, { search: search }));
			case 'G Suite':
				if (gSuiteRoles) {
					return this.http.get(
						constructUrl(`v1/schools/${this.http.getSchool().id}/gsuite_users`, {
							search: search,
							profile: gSuiteRoles,
						})
					);
				} else {
					return this.http.get(
						constructUrl(`v1/schools/${this.http.getSchool().id}/gsuite_users`, {
							search: search,
						})
					);
				}
			case 'GG4L':
				if (excludeProfile) {
					return this.http.get(
						constructUrl(`v1/schools/${this.http.getSchool().id}/gg4l_users`, {
							search: search,
							profile: excludeProfile,
						})
					);
				} else {
					return this.http.get(
						constructUrl(`v1/schools/${this.http.getSchool().id}/gg4l_users`, {
							search,
						})
					);
				}
		}
	}

	setUserActivityRequest(profile, active: boolean, role: string) {
		this.store.dispatch(updateAccountActivity({ profile, active, role }));
		return of(null);
	}

	setUserActivity(id, activity: boolean) {
		return this.http.patch(`v1/users/${id}/active`, { active: activity });
	}

	addAccountRequest(school_id, user, userType, roles: string[], role, behalf?: User[]) {
		this.store.dispatch(postAccounts({ school_id, user, userType, roles, role, behalf }));
		return of(null);
	}

	addAccountToSchool(id, user, userType: string, roles: Array<string>) {
		if (userType === 'gsuite') {
			return this.http.post(`v1/schools/${id}/add_user`, {
				type: 'gsuite',
				email: user.email,
				profiles: roles,
			});
		} else if (userType === 'email') {
			return this.http.post(`v1/schools/${id}/add_user`, {
				type: 'email',
				email: user.email,
				password: user.password,
				first_name: user.first_name,
				last_name: user.last_name,
				display_name: user.display_name,
				profiles: roles,
			});
		} else if (userType === 'username') {
			return this.http.post(`v1/schools/${id}/add_user`, {
				type: 'username',
				username: user.email,
				password: user.password,
				first_name: user.first_name,
				last_name: user.last_name,
				display_name: user.display_name,
				profiles: roles,
			});
		}
	}

	addUserToProfilesRequest(user: User, roles: string[]) {
		this.store.dispatch(addUserToProfiles({ user, roles }));
	}

	addUserToProfiles(id: string | number, roles: string[]): Observable<User> {
		return this.http.patch(`v1/users/${id}/profiles`, { profiles: roles });
	}

	addUserToProfile(id, role) {
		return this.http.put(`v1/users/${id}/profiles/${role}`);
	}

	createUserRolesRequest(profile, permissions, role) {
		this.store.dispatch(updateAccountPermissions({ profile, permissions, role }));
		return of(null);
	}

	createUserRoles(id, data) {
		return this.http.patch(`v1/users/${id}/roles`, data);
	}

	deleteUserRequest(user: User, role) {
		this.store.dispatch(removeAccount({ user, role }));
		return of(null);
	}

	deleteUser(id) {
		return this.http.delete(`v1/users/${id}`);
	}

	deleteUserFromProfile(id, role) {
		return this.http.delete(`v1/users/${id}/profiles/${role}`);
	}

	getRepresentedUsers(id) {
		return this.http.get(`v1/users/${id}/represented_users`);
	}

	addRepresentedUserRequest(profile, user: User) {
		this.store.dispatch(addRepresentedUserAction({ profile, user }));
		return of(null);
	}

	addRepresentedUser(id: number, repr_user: User) {
		return this.http.put(`v1/users/${id}/represented_users/${repr_user.id}`);
	}

	deleteRepresentedUserRequest(profile, user: User) {
		this.store.dispatch(removeRepresentedUserAction({ profile, user }));
		return of(null);
	}

	deleteRepresentedUser(id: number, repr_user: User) {
		return this.http.delete(`v1/users/${id}/represented_users/${repr_user.id}`);
	}

	getStudentGroupsRequest() {
		this.store.dispatch(getStudentGroups());
		return this.studentGroups$;
	}

	getStudentGroups() {
		return this.http.get('v1/student_lists');
	}

	createStudentGroupRequest(group) {
		this.store.dispatch(postStudentGroup({ group }));
		return this.currentStudentGroup$;
	}

	createStudentGroup(data) {
		return this.http.post('v1/student_lists', data);
	}

	updateStudentGroupRequest(id, group) {
		this.store.dispatch(updateStudentGroup({ id, group }));
		return this.currentStudentGroup$.pipe(filter((sg) => !!sg));
	}

	updateStudentGroup(id, body) {
		return this.http.patch(`v1/student_lists/${id}`, body);
	}

	deleteStudentGroupRequest(id) {
		this.store.dispatch(removeStudentGroup({ id }));
		return this.currentStudentGroup$;
	}

	deleteStudentGroup(id) {
		return this.http.delete(`v1/student_lists/${id}`);
	}

	getUserWithTimeout(max: number = 10000): Observable<User | null> {
		return race<User | null>(this.userData, interval(max).pipe(map(() => null))).pipe(take(1));
	}

	getAccountsRoles(role: string = '', search: string = '', limit: number = 0) {
		this.store.dispatch(getAccounts({ role, search, limit }));
		return this.getAccountsRole(role);
	}

	getUsersList(role: string = '', search: string = '', limit: number = 0, include_numbers?: boolean) {
		const params: any = {};
		if (role !== '' && role !== '_all') {
			params.role = role;
		}

		if (search !== '') {
			params.search = search;
		}
		if (limit) {
			params.limit = limit;
		}
		if (include_numbers) {
			params.include_numbers = true;
		}

		return this.http.get<any>(constructUrl('v1/users', params));
	}

	getMoreUserListRequest(role: string): Observable<User[]> {
		this.store.dispatch(getMoreAccounts({ role }));
		return this.lastAddedAccounts$[role];
	}

	exportUserData(id) {
		return this.http.get(`v1/users/${id}/export_data`);
	}

	checkUserEmail(email) {
		return this.http.post('v1/check-email', { email });
	}

	addBulkAccountsRequest(accounts) {
		this.store.dispatch(bulkAddAccounts({ accounts }));
		return of(null);
	}

	addBulkAccounts(accounts) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
		};
		return this.http.post('v1/users/bulk-add?should_commit=true', accounts, httpOptions, false);
	}

	sortTableHeaderRequest(role, queryParams) {
		this.store.dispatch(sortAccounts({ role, queryParams }));
	}

	sortTableHeader(queryParams) {
		return this.http.get(constructUrl('v1/users', queryParams));
	}

	updateEffectiveUser(effectiveUser) {
		this.store.dispatch(updateEffectiveUser({ effectiveUser }));
	}

	clearRepresentedUsers() {
		this.store.dispatch(clearRUsers());
	}

	createUploadGroup() {
		return this.http.post(`v1/file_upload_groups`);
	}

	postProfilePicturesRequest(userIds: string[] | number[], pictures: File[]) {
		this.store.dispatch(postProfilePictures({ pictures, userIds }));
		return this.profiles$;
	}

	uploadProfilePictures(image_files, user_ids, group_id?) {
		const data = group_id ? { image_files, user_ids, group_id, commit: true } : { image_files, user_ids, commit: true };
		return this.http.post(`v1/schools/${this.http.getSchool().id}/attach_profile_pictures`, data);
	}

	bulkAddProfilePictures(files: File[]) {
		const file_names = files.map((file) => file.name);
		const content_types = files.map((file) => (file.type ? file.type : 'image/jpeg'));
		return this.http.post('v1/file_uploads/bulk_create_url', { file_names, content_types });
	}

	setProfilePictureToGoogle(url: string, file: File, content_type: string) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': content_type,
			}),
		};
		return this.httpClient.put(url, file, httpOptions);
	}

	addProfilePictureRequest(profile: User, role: string, file: File) {
		this.store.dispatch(updateAccountPicture({ profile, role, file }));
	}

	addProfilePicture(userId, file: File) {
		return this.http.patch(`v1/users/${userId}/profile-picture`, { profile_picture: file });
	}

	updateTeacherLocations(teacher, locations, newLocations) {
		this.store.dispatch(updateTeacherLocations({ teacher, locations, newLocations }));
	}

	putProfilePicturesErrorsRequest(errors) {
		this.store.dispatch(putUploadErrors({ errors }));
	}

	putProfilePicturesErrors(uploadedGroupId, levels: string[], messages: string[]) {
		return this.http.put(`v1/file_upload_groups/${uploadedGroupId}/events`, { levels, messages });
	}

	getUploadedGroupsRequest() {
		this.store.dispatch(getProfilePicturesUploadedGroups());
	}

	createPPicturesUploadGroup() {
		this.store.dispatch(createUploadGroup());
		return this.currentUploadedGroup$;
	}

	getUploadedGroups() {
		return this.http.get(`v1/file_upload_groups`);
	}

	getMissingProfilePicturesRequest() {
		this.store.dispatch(getMissingProfilePictures());
	}

	getMissingProfilePictures() {
		return this.http.get(`v1/users?role=_profile_student&has_picture=false`);
	}

	getUploadedErrorsRequest(group_id) {
		this.store.dispatch(getUploadedErrors({ group_id }));
		return this.profilePicturesUploadErrors$;
	}

	getUploadedErrors(group_id) {
		return this.http.get(`v1/file_upload_groups/${group_id}/events`);
	}

	clearProfilePicturesErrors() {
		this.store.dispatch(clearProfilePicturesUploadErrors());
	}

	clearCurrentUpdatedAccounts() {
		this.store.dispatch(clearCurrentUpdatedAccount());
	}

	deleteProfilePicture(user: User, role: string) {
		this.store.dispatch(deleteProfilePicture({ user, role }));
		return this.currentUpdatedAccount$[role];
	}

	clearUploadedData() {
		this.store.dispatch(clearUploadedData());
	}

	getUserStatsRequest(userId, queryParams?) {
		return this.store.dispatch(getStudentStats({ userId, queryParams }));
	}

	getUserStats(userId: string | number, queryParams) {
		return this.http.get(constructUrl(`v1/users/${userId}/stats`, queryParams));
	}

	getNuxRequest() {
		this.store.dispatch(getNuxAction());
	}

	getNux() {
		return this.http.get('v1/nux');
	}

	getStatusOfIDNumber() {
		return this.http.get(`v1/integrations/upload/custom_ids/setup`);
	}

	uploadIDNumbers(body) {
		return this.http.post('v1/integrations/upload/custom_ids', body);
	}

	getMissingIDNumbers() {
		return this.http.get(`v1/users?has_custom_id=false`);
	}

	getStatusOfGradeLevel() {
		return this.http.get(`v1/integrations/upload/grade_levels/setup`);
	}

	uploadGradeLevels(body) {
		return this.http.post('v1/integrations/upload/grade_levels', body);
	}

	getMissingGradeLevels() {
		return this.http.get(`v1/users?role=_profile_student&has_grade_level=false`);
	}

	possibleProfileByCustomId(id: string, ignoreProfileWithStatuses: ProfileStatus[] = ['suspended']): Observable<User | null> {
		let url = `v1/users/custom_id/${id}?`;

		for (const hideStatus of ignoreProfileWithStatuses) {
			url += `hideStatus=${hideStatus}&`;
		}
		if (url[url.length - 1] === '&') {
			url = url.slice(0, -1);
		}

		return this.http.get(url, { headers: { 'X-Ignore-Errors': 'true' } }).pipe(catchError((err) => of(null)));
	}

	getGradeLevelsByIds(ids: string[]) {
		const q = ids.map((x) => x.trim()).join(',');
		const opt = !!q ? { params: new HttpParams().set('student_id', q) } : {};
		return this.http.get('v1/users/grade_level', opt);
	}

	listOf(params: { email: string[] }) {
		const headers = {
			'Content-Type': 'application/json',
		};
		return this.http.post('v1/users/listof', { params }, { headers }, false);
	}
}
