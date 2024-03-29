import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	TemplateRef,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Observable, of, Subject, zip } from 'rxjs';
import { TotalAccounts } from '../../../models/TotalAccounts';
import { AdminService } from '../../../services/admin.service';
import { DarkThemeSwitch } from '../../../dark-theme-switch';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddUserDialogComponent } from '../../add-user-dialog/add-user-dialog.component';
import { User } from '../../../models/User';
import { debounceTime, filter, map, mapTo, skipUntil, switchMap, take, takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { AddAccountPopupComponent } from '../add-account-popup/add-account-popup.component';
import { SchoolSyncInfo } from '../../../models/SchoolSyncInfo';
import { IntegrationsDialogComponent } from '../integrations-dialog/integrations-dialog.component';
import { Ggl4SettingsComponent } from '../integrations-dialog/ggl4-settings/ggl4-settings.component';
import { GSuiteSettingsComponent } from '../g-suite-settings/g-suite-settings.component';
import { GSuiteOrgs } from '../../../models/GSuiteOrgs';
import { TableFilterOption, TableService } from '../../sp-data-table/table.service';
import { PermissionsDialogComponent } from '../../accounts-role/permissions-dialog/permissions-dialog.component';
import { StatusPopupComponent } from '../../profile-card-dialog/status-popup/status-popup.component';
import { ToastService } from '../../../services/toast.service';
import { EncounterPreventionDialogComponent } from '../encounter-prevention-dialog/encounter-prevention-dialog.component';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';
import * as moment from 'moment';
import { AdminPassLimitDialogComponent } from '../../../admin-pass-limits-dialog/admin-pass-limits-dialog.component';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { PassLimitBulkEditComponent } from '../../../pass-limit-bulk-edit/pass-limit-bulk-edit.component';
import { RecommendedDialogConfig } from '../../../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import { PassLimitService } from '../../../services/pass-limit.service';
import { InviteFamiliesDialogComponent } from '../../invite-families-dialog/invite-families-dialog.component';
import { Actions, ofType } from '@ngrx/effects';
import { addUserToProfilesSuccess } from '../../../ngrx/accounts/actions/accounts.actions';

@Component({
	selector: 'app-accounts-header',
	templateUrl: './accounts-header.component.html',
	styleUrls: ['./accounts-header.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() pending$: Subject<boolean>;
	@Input() schoolSyncInfoData: SchoolSyncInfo;
	@Input() gSuiteOrgs: GSuiteOrgs;
	@Input() showTabs = true;

	@Output() tableStateEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() searchValueEmit: EventEmitter<any> = new EventEmitter<any>();
	@Output() currentPageEmit: EventEmitter<string> = new EventEmitter<string>();

	@ViewChild('tabPointer') tabPointer: ElementRef;
	@ViewChild('navButtonsContainer') navButtonsContainerRef: ElementRef;
	@ViewChild('wrapper') wrapper: ElementRef;
	@ViewChild('filterDialogTemplate') filterDialogTemplate: TemplateRef<HTMLElement>;
	@ViewChildren('tabRef') tabRefs: QueryList<ElementRef<HTMLDivElement>>;

	pts: string;
	currentTab: string;
	forceFocus$: Subject<boolean> = new Subject<boolean>();

	user$: Observable<User>;
	isMiniButtons: boolean;
	showPassLimitsOnlyCertainRoomsNux = new Subject<boolean>();
	introsData: any;
	nuxWrapperPosition: ConnectedPosition = {
		originX: 'end',
		originY: 'bottom',
		overlayX: 'end',
		overlayY: 'top',
		offsetY: 15,
	};
	bulkEditDialogRef: MatDialogRef<PassLimitBulkEditComponent>;

	selectedUsers: User[] = [];

	destroy$ = new Subject();

	public accounts$: Observable<TotalAccounts> = this.adminService.countAccounts$;

	public accountsButtons = [
		// { title: 'Overview', param: '', icon_id: '#Overview' },
		{ title: 'Students', param: '_profile_student', icon_id: '#Student', role: 'student_count' },
		{ title: 'Teachers', param: '_profile_teacher', icon_id: '#Teacher', role: 'teacher_count' },
		{ title: 'Admins', param: '_profile_admin', icon_id: '#Admin', role: 'admin_count' },
		{ title: 'Assistants', param: '_profile_assistant', icon_id: '#Assistant', role: 'assistant_count' },
		// {title: 'Parents', param: '_profile_parent', icon_id: '#Parent', role: 'parent_count'}
	];

	filterOptions: TableFilterOption[] = [
		{
			text: 'Has Individual Pass Limit',
			label: 'hasIndividualPassLimit',
			roles: ['_profile_student'], // to be used for later, more complex implementations
			filterCallback: (account): boolean => account?.limit?.isIndividual,
		},
	];

	isFilterActive$ = this.tableService.activeFilters$.pipe(
		map((f) => {
			return Object.values(f).filter(Boolean).length > 0;
		})
	);
	activeFilters$;
	adminPassLimitDialogRef: MatDialogRef<AdminPassLimitDialogComponent>;

	@HostListener('window:resize', ['$event.target'])
	onResize(event) {
		this.isMiniButtons = this.wrapper.nativeElement.clientWidth <= 1050;
	}

	constructor(
		private adminService: AdminService,
		public darkTheme: DarkThemeSwitch,
		private matDialog: MatDialog,
		private userService: UserService,
		private router: Router,
		private tableService: TableService,
		private toast: ToastService,
		private cdr: ChangeDetectorRef,
		private passLimitsService: PassLimitService,
		private actions$: Actions
	) {}

	get showIntegrations$() {
		return this.user$.pipe(
			filter((u) => !!u),
			map((user) => user.roles.includes('admin_manage_integration'))
		);
	}

	get parentAccountAccess(): boolean {
		return this.userService.getFeatureFlagParentAccount();
	}

	ngOnInit() {
		if (this.userService.getFeatureFlagParentAccount()) {
			this.accountsButtons.push({ title: 'Parents', param: '_profile_parent', icon_id: '#Parent', role: 'parent_count' });
		}
		this.activeFilters$ = this.tableService.activeFilters$;
		this.getCurrentTab();
		this.user$ = this.userService.user$;
		if (this.showTabs && this.currentTab === '') {
			this.router.navigate(['admin/accounts', '_profile_student']);
		}
		this.router.events.pipe(takeUntil(this.destroy$)).subscribe((value) => {
			this.selectedUsers = [];
			this.getCurrentTab();
			this.cdr.detectChanges();
		});

		this.tableService.selectRow
			.asObservable()
			.pipe(
				switchMap((selected) => {
					return combineLatest(of(selected), this.userService.accountsEntities[this.currentTab].pipe(take(1)));
				}),
				map(([selected, users]) => {
					return selected.map((user) => users[user.id]);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe((res) => {
				this.selectedUsers = res;
				this.cdr.detectChanges();
			});

		combineLatest(
			this.userService.introsData$.pipe(filter((res) => !!res)),
			this.userService.nuxDates$.pipe(filter((r) => !!r)),
			this.user$.pipe(filter((r) => !!r))
		)
			.pipe(debounceTime(1000), takeUntil(this.destroy$))
			.subscribe(([intros, nuxDates, user]) => {
				this.introsData = intros;
				const showNux =
					moment(user.first_login).isBefore(this.passLimitsOnlyForCertainRoomsLaunchDate) &&
					!intros?.admin_pass_limits_only_certain_rooms?.universal?.seen_version;
				this.showPassLimitsOnlyCertainRoomsNux.next(showNux);
			});

		this.actions$.pipe(ofType(addUserToProfilesSuccess)).subscribe({
			next: () => this.adminService.getCountAccountsRequest(),
		});
	}

	passLimitsOnlyForCertainRoomsLaunchDate = moment('03-15-2023', 'MM-DD-YYYY');

	ngAfterViewInit(): void {
		this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainerRef);
		this.isMiniButtons = this.wrapper.nativeElement.clientWidth <= 1260;
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getCurrentTab() {
		const urlSplit: string[] = this.router.url.split('/');
		this.currentTab = urlSplit[urlSplit.length - 1] === 'accounts' ? '' : urlSplit[urlSplit.length - 1];
		this.currentPageEmit.emit(this.currentTab);
	}

	getCountAccounts(count: TotalAccounts) {
		if (this.currentTab === '_profile_admin') {
			return count.admin_count + ' admins';
		} else if (this.currentTab === '_profile_teacher') {
			return count.teacher_count + ' teachers';
		} else if (this.currentTab === '_profile_student') {
			return count.student_count + ' students';
		} else if (this.currentTab === '_profile_assistant') {
			return count.assistant_count + ' assistants';
		} else if (this.currentTab === '_profile_parent') {
			return count.parent_count + ' parents';
		}
	}

	addUser(element) {
		const AAD = this.matDialog.open(AddAccountPopupComponent, {
			panelClass: 'calendar-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: new ElementRef(element.currentTarget),
				syncData: this.schoolSyncInfoData,
			},
		});
		AAD.afterClosed()
			.pipe(filter((res) => !!res))
			.subscribe((action) => {
				if (action === 'gg4l' || action === 'g_suite' || action === 'standard') {
					const DR = this.matDialog.open(AddUserDialogComponent, {
						width: '425px',
						height: '500px',
						panelClass: 'accounts-profiles-dialog',
						backdropClass: 'custom-bd',
						data: {
							role: !this.currentTab ? '_all' : this.currentTab,
							title: (action === 'gg4l' ? 'Add GG4L' : action === 'g_suite' ? 'Add G Suite' : 'Add') + ' Account',
							syncInfo: this.schoolSyncInfoData,
							icon:
								action === 'gg4l'
									? './assets/GG4L Icon.svg'
									: action === 'g_suite'
									? './assets/Google (White).svg'
									: './assets/Add Account (White).svg',
							type: action === 'gg4l' ? 'GG4L' : action === 'g_suite' ? 'G Suite' : 'Standard',
						},
					});
				} else if (action === 'bulk') {
					// const BAAD = this.matDialog.open(BulkAddComponent, {
					//   width: '425px', height: '500px',
					//   panelClass: 'accounts-profiles-dialog',
					//   backdropClass: 'custom-bd',
					//   data: {
					//     role: !this.currentTab ? '_all' : this.currentTab,
					//   }
					// });
				}
			});
	}

	openPermissions(event) {
		const permissions = this.matDialog.open(PermissionsDialogComponent, {
			width: '425px',
			height: '500px',
			panelClass: 'accounts-profiles-dialog',
			backdropClass: 'custom-bd',
			data: {
				users: this.selectedUsers,
			},
		});

		permissions
			.afterClosed()
			.pipe(filter((res) => !!res))
			.subscribe(() => {
				this.selectedUsers = [];
				this.tableService.clearSelectedUsers.next();
			});
	}

	updateTab(route) {
		this.router.navigate(['/admin/accounts/', route]);
		this.forceFocus$.next(true);
	}

	selectTab(event: HTMLElement, container: HTMLElement) {
		const containerRect = container.getBoundingClientRect();
		const selectedTabRect = event.getBoundingClientRect();
		const tabPointerHalfWidth = this.tabPointer.nativeElement.getBoundingClientRect().width / 4;
		this.pts = Math.round(selectedTabRect.left - containerRect.left + tabPointerHalfWidth) - (this.currentTab === '_profile_admin' ? 7 : 0) + 'px';
	}

	setCurrentUnderlinePos(refsArray: QueryList<ElementRef>, buttonsContainer: ElementRef, timeout: number = 200) {
		setTimeout(() => {
			const tabRefsArray = refsArray.toArray();
			const selectedTabRef = this.accountsButtons.findIndex((button) => button.param === this.currentTab);
			if (tabRefsArray[selectedTabRef]) {
				this.selectTab(tabRefsArray[selectedTabRef].nativeElement, buttonsContainer.nativeElement);
			}
			this.cdr.detectChanges();
		}, timeout);
	}

	openFilterDialog() {
		const coords = this.tabRefs.first.nativeElement.getBoundingClientRect();
		const filterDialogRef = this.matDialog.open(this.filterDialogTemplate, {
			...RecommendedDialogConfig,
			backdropClass: ['custom-backdrop', 'cdk-overlay-transparent-backdrop'],
			panelClass: ['overlay-dialog', 'action-sheet-dialog'],
			width: '244px',
			position: {
				top: `${coords.bottom + 10}px`,
				left: `${coords.left}px`,
			},
		});

		filterDialogRef
			.afterClosed()
			.pipe(filter(Boolean))
			.subscribe({
				next: (selectedFilter: TableFilterOption) => {
					this.tableService.activeFilters$.next({
						...this.tableService.activeFilters$.value,
						[selectedFilter.label]: selectedFilter,
					});
				},
			});
	}

	removeFilter(filterLabel: string) {
		const filters = this.tableService.activeFilters$.getValue();
		delete filters[filterLabel];
		this.tableService.activeFilters$.next(filters);
	}

	// TODO: Make Pass Limit into its own component
	openBulkEditPassLimits() {
		this.bulkEditDialogRef = this.matDialog.open(PassLimitBulkEditComponent, {
			...RecommendedDialogConfig,
			width: '425px',
			height: '500px',
			data: {
				students: this.selectedUsers.filter((u) => u.roles.includes('_profile_student')),
			},
		});

		this.bulkEditDialogRef.afterClosed().subscribe({
			next: (triggeredUpdate) => {
				this.selectedUsers = [];
				this.tableService.clearSelectedUsers.next();
				this.cdr.detectChanges();

				if (triggeredUpdate) {
					this.tableService.activeFilters$.next(this.tableService.activeFilters$.value);
				}
			},
		});
	}

	openStatusPopup(event) {
		const SPC = this.matDialog.open(StatusPopupComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: event.currentTarget,
				profileStatus: true,
				bulkEdit: true,
				withoutDelete: true,
				adjustForScroll: true,
			},
		});

		SPC.afterClosed()
			.pipe(
				filter((res) => !!res),
				switchMap((res) => {
					if (res === 'delete') {
						return zip(
							...this.selectedUsers.map((user) => {
								if (User.fromJSON(user).userRoles().length > 1) {
									return zip(
										...User.fromJSON(user)
											.userRoles()
											.map((role) => {
												return this.userService.deleteUserRequest(user, role);
											})
									);
								} else {
									return this.userService.deleteUserRequest(user, this.currentTab);
								}
							})
						).pipe(mapTo(res));
					} else {
						let count = 0;
						return zip(
							...this.selectedUsers.map((user) => {
								count += 1;
								return this.userService.updateUserRequest(user, { status: res });
							})
						).pipe(mapTo({ action: res, count }));
					}
				})
			)
			.subscribe(({ action, count }) => {
				if (action === 'delete') {
					this.toast.openToast({ title: `${count} account${count > 1 ? 's' : ''} deleted`, type: 'error' });
				} else {
					this.toast.openToast({ title: `${count} account statuses updated`, type: 'success' });
				}
				this.tableService.clearSelectedUsers.next();
				setTimeout(() => {
					this.adminService.getCountAccountsRequest();
				}, 500);
				this.clearData();
			});
	}

	search(value) {
		this.adminService.searchAccountEmit$.next(value);
	}

	openIntegrations() {
		const ID = this.matDialog.open(IntegrationsDialogComponent, {
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '500px',
			data: { gSuiteOrgs: this.gSuiteOrgs },
		});

		ID.afterClosed()
			.pipe(filter((res) => !!res))
			.subscribe(({ action, status }) => {
				this.openSettingsDialog(action, status);
			});
	}

	openPassLimits() {
		this.adminPassLimitDialogRef = this.matDialog.open(AdminPassLimitDialogComponent, {
			hasBackdrop: true,
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '500px',
		});

		this.adminPassLimitDialogRef
			.afterClosed()
			.pipe(skipUntil(this.passLimitsService.individualLimitUpdate$))
			.subscribe({
				next: () => {
					this.tableService.activeFilters$.next(this.tableService.activeFilters$.getValue());
				},
			});
	}

	inviteFamilies() {
		const dialogRef = this.matDialog.open(InviteFamiliesDialogComponent, {
			panelClass: 'accounts-profiles-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '480px',
		});
	}

	openSettingsDialog(action, status) {
		if (action === 'gg4l' || action === 'clever') {
			const gg4l = this.matDialog.open(Ggl4SettingsComponent, {
				panelClass: 'overlay-dialog',
				backdropClass: 'custom-bd',
				width: '425px',
				height: '500px',
				data: { status, action },
			});
		} else if (action === 'g_suite') {
			const g_suite = this.matDialog.open(GSuiteSettingsComponent, {
				panelClass: 'overlay-dialog',
				backdropClass: 'custom-bd',
				width: '425px',
				height: '500px',
			});
		} else if (action === 'profile_pictures') {
			const PPD = this.matDialog.open(ProfilePictureComponent, {
				panelClass: 'accounts-profiles-dialog',
				backdropClass: 'custom-bd',
				width: '425px',
				height: '500px',
			});
		}
	}

	clearData() {
		this.selectedUsers = [];
		this.tableService.clearSelectedUsers.next();
		this.cdr.detectChanges();
	}

	openEncounterPrevention() {
		const encounterDialog = this.matDialog.open(EncounterPreventionDialogComponent, {
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '500px',
		});
	}

	dismissPassLimitsOnlyCertainRoomsNux() {
		this.showPassLimitsOnlyCertainRoomsNux.next(false);
		this.userService.updateIntrosPassLimitsOnlyCertainRoomsRequest(this.introsData, 'universal', '1');
	}
}
