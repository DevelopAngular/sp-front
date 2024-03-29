import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { fromEvent, merge, Observable, of, Subject, zip } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap, catchError } from 'rxjs/operators';
import { cloneDeep, isArray, uniqBy } from 'lodash';

import { XlsxService } from '../../../services/xlsx.service';
import { ZipService } from '../../../services/zip.service';
import { UserService } from '../../../services/user.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConsentMenuComponent } from '../../../consent-menu/consent-menu.component';
import { ToastService } from '../../../services/toast.service';
import { User } from '../../../models/User';
import { ProfilePicturesError } from '../../../models/ProfilePicturesError';
import { ProfilePicturesUploadGroup } from '../../../models/ProfilePicturesUploadGroup';
import * as moment from 'moment';
import { SettingsDescriptionPopupComponent } from '../../../settings-description-popup/settings-description-popup.component';
import { UNANIMATED_CONTAINER } from '../../../consent-menu-overlay';
import { School } from '../../../models/School';
import { AdminService } from '../../../services/admin.service';

type MapFile = { user_id: string | number; file_name: string; isUserId: boolean; isFileName: boolean };
type MapFileUsedID = MapFile & { usedId: boolean };

// it serves to propagate an error through the rxjs pipe
// and be handled in subscribe, without triggering complete and thus keeping the stream alive
class ElsewhereError extends Error {}

// is used with along with ElsewhereError
// it signals that code must not handle items
// it replace null value with a specific value
class SkipItems {}
const SKIP_ITEMS = new SkipItems();

@Component({
	selector: 'app-profile-picture',
	templateUrl: './profile-picture.component.html',
	styleUrls: ['./profile-picture.component.scss'],
})
export class ProfilePictureComponent implements OnInit, OnDestroy {
	@Input() page: number = 2;

	@Output() backEmit: EventEmitter<any> = new EventEmitter();

	@ViewChild('dots') dots: ElementRef;

	@ViewChild('csvFile') set fileRef(fileRef: ElementRef) {
		if (fileRef?.nativeElement) {
			// to ensure that same file can be taken again
			// it makes change event to be triggerable
			fromEvent(fileRef.nativeElement, 'click')
				.pipe(
					tap((evt: Event) => {
						(evt.target as HTMLInputElement).value = '';
					}),
					takeUntil(this.destroy$)
				)
				.subscribe();

			fromEvent(fileRef.nativeElement, 'change')
				.pipe(
					takeUntil(this.destroy$),
					filter(() => fileRef.nativeElement.files.length),
					switchMap(() => {
						const $el = fileRef.nativeElement.files[0];
						const extension = $el.name.toLowerCase().split('.')[$el.name.split('.').length - 1].toLowerCase();
						if (extension === 'csv' || extension === 'xlsx') {
							// mapFile is to be checked for valid rows
							this.selectedMapFile = fileRef.nativeElement.files[0];
							// show UI hint
							this.uploadingProgress.csv.inProcess = true;
							this.uploadingProgress.csv.complete = false;
							// down to the main pipe a new stream of File[]
							const FR = new FileReader();
							FR.readAsBinaryString(fileRef.nativeElement.files[0]);
							return fromEvent(FR, 'load');
						} else {
							// or an error that will jump from operator to operator
							// down the road to subscribe
							return of(new ElsewhereError('Sorry, please upload a file ending in .csv or .xlsx'));
						}
					}),
					map((res: Event | ElsewhereError) => {
						// sent it down through the pipe to the subscribe
						if (res instanceof ElsewhereError) {
							return res;
						}
						return this.xlsxService.parseXlSXFile(res);
					}),
					switchMap((rows: ElsewhereError | Array<MapFileUsedID[]>) => {
						// return adapted to subscribe callback
						// SKIP_ITEMS signals no need for the flow to carry on
						if (rows instanceof ElsewhereError) {
							return of([SKIP_ITEMS, [rows]]);
						}

						// the empty case is dealt in subscribe
						if (rows.length === 0) {
							return of([rows, []]);
						}

						const errors = [];
						const validated: MapFileUsedID[] = rows
							// we split here the rows into valid rows and
							// invalid ones collected into errors as Error[]
							.map((row: any[]) => {
								if (typeof row[0] === 'string' && row[0].includes('@spnx.local')) {
									row[0] = row[0].replace('@spnx.local', '');
								}

								try {
									const maybeValid: MapFileUsedID = {
										user_id: typeof row[0] === 'string' ? row[0].toLowerCase().trim() : row[0],
										file_name: row[1].toLowerCase().trim(),
										isUserId: !!row[0],
										isFileName: !!row[1],
										usedId: false,
									};
									return maybeValid;
								} catch (err) {
									console.log(err);
									// errors are sent and checked in subscribe
									errors.push(err);
									return false;
								}
							})
							.filter(Boolean) as MapFileUsedID[];

						const result: [MapFileUsedID[], Error[]] = [validated, errors];
						return of(result);
					})
				)
				.subscribe((result: [MapFileUsedID[] | SkipItems, (Error | ElsewhereError)[]]) => {
					const [items, errors]: [MapFileUsedID[] | SkipItems, (Error | ElsewhereError)[]] = result;

					// errors that can be bypassed, just notify the user
					// and let the valid rows to be processed further
					if (errors.length) {
						this.toastService.openToast({
							title: 'Type error',
							subtitle: errors[0] instanceof ElsewhereError ? errors[0].message : `File had ${errors.length} record(s) with errors `,
							type: 'error',
						});
					}

					if (items instanceof SkipItems || items === SKIP_ITEMS) {
						this.uploadingProgress.csv.inProcess = false;
						this.uploadingProgress.csv.complete = true;
						return;
					}

					if (!items.length) {
						this.toastService.openToast({ title: 'Type error', subtitle: 'No valid records', type: 'error' });
						this.uploadingProgress.csv.inProcess = false;
						this.uploadingProgress.csv.complete = false;
						return;
					}

					this.selectedMapFile = fileRef.nativeElement.files[0];
					this.selectedMapFiles = items;
					this.uploadingProgress.csv.inProcess = false;
					this.uploadingProgress.csv.complete = true;
				});
		}
	}

	@ViewChild('zip') set zipRef(fileRef: ElementRef) {
		if (fileRef?.nativeElement) {
			fromEvent(fileRef.nativeElement, 'change')
				.pipe(
					filter(() => fileRef.nativeElement.files.length),
					switchMap(() => {
						const filesStream = [];
						if (fileRef.nativeElement.files.length === 1) {
							const extension = fileRef.nativeElement.files[0].name
								.toLowerCase()
								.split('.')
								[fileRef.nativeElement.files[0].name.split('.').length - 1].toLowerCase();
							if (extension !== 'zip' && extension !== 'jpeg' && extension !== 'jpg' && extension !== 'png') {
								return of(null);
							}
						}
						this.uploadingProgress.images.inProcess = true;
						for (let i = 0; i < fileRef.nativeElement.files.length; i++) {
							const file: File = fileRef.nativeElement.files.item(i);
							const extension = file.name.toLowerCase().split('.')[file.name.split('.').length - 1].toLowerCase();
							if (extension === 'zip' || extension === 'jpeg' || extension === 'jpg' || extension === 'png') {
								if (extension === 'zip') {
									filesStream.push(this.zipService.loadZip(file));
								} else if (extension === 'jpeg' || extension === 'jpg' || extension === 'png') {
									const reader = new FileReader();
									reader.readAsDataURL(file);
									filesStream.push(
										fromEvent(reader, 'load').pipe(
											map((_) => {
												return { file_name: file.name.toLowerCase().trim(), file: file };
											})
										)
									);
								}
							}
						}
						return zip(...filesStream);
					}),
					filter((res) => !!res),
					map((result) => {
						let arrayFiles = [];
						result.forEach((item: Array<File> | File) => {
							if (isArray(item)) {
								arrayFiles = [...arrayFiles, ...item];
							} else {
								arrayFiles = [...arrayFiles, item];
							}
						});
						return uniqBy(arrayFiles, 'file_name');
					})
				)
				.subscribe((files: { file: File; file_name: string }[]) => {
					this.imagesLength = files.length;
					this.selectedImgFiles = this.parseArrayToObject(files);
					this.uploadingProgress.images.inProcess = false;
					this.uploadingProgress.images.complete = true;
				});
		}
	}

	@ViewChild('fgf1') stop: ElementRef;

	form: FormGroup;
	selectedMapFiles: MapFile[] = [];
	selectedImgFiles: { file: File; file_name: string }[];
	selectedMapFile: File;
	filesToDB: any[] = [];
	imagesLength: number;
	uploadingProgress = {
		images: { inProcess: false, complete: false, error: null },
		csv: { inProcess: false, complete: false, error: null },
	};
	picturesLoaderPercent$: Observable<number>;
	showProcessingSpinner$: Observable<boolean>;
	accountsWithoutPictures$: Observable<User[]>;
	uploadErrors$: Observable<ProfilePicturesError[]>;
	lastUploadedGroup$: Observable<ProfilePicturesUploadGroup>;
	uploadedGroups$: Observable<ProfilePicturesUploadGroup[]>;
	user$: Observable<User>;

	school: School;

	issues = [];
	errors = [];

	destroy$: Subject<any> = new Subject<any>();

	uploadedProfiles: any = [];
	allProfiles: any = [];

	constructor(
		public dialogRef: MatDialogRef<ProfilePictureComponent>,
		private xlsxService: XlsxService,
		private zipService: ZipService,
		public dialog: MatDialog,
		private userService: UserService,
		private toastService: ToastService,
		private renderer: Renderer2,
		private adminService: AdminService
	) {}

	ngOnInit() {
		this.form = new FormGroup({
			images: new FormControl(),
			csvFile: new FormControl(),
		});
		this.picturesLoaderPercent$ = this.userService.profilePictureLoaderPercent$;
		this.showProcessingSpinner$ = this.picturesLoaderPercent$.pipe(map((percent) => percent >= 95));
		this.accountsWithoutPictures$ = this.userService.missingProfilePictures$;
		this.uploadErrors$ = this.userService.profilePicturesUploadErrors$;
		this.lastUploadedGroup$ = this.userService.lastUploadedGroup$;

		// get groups from api and re-fresh the store
		this.userService.getUploadedGroupsRequest();
		this.uploadedGroups$ = this.userService.uploadedGroups$.pipe(
			map((groups) => {
				return groups.reverse();
			})
		);
		this.user$ = this.userService.user$;

		this.picturesLoaderPercent$
			.pipe(
				filter((v) => !!v && !!this.stop),
				takeUntil(this.destroy$)
			)
			.subscribe((res) => {
				this.renderer.setAttribute(this.stop.nativeElement, 'offset', `${res}%`);
			});

		this.userService.profilePicturesLoaded$
			.pipe(
				filter((loaded) => this.page === 3 && loaded),
				takeUntil(this.destroy$),
				switchMap(() => {
					const files = this.filesToDB.reduce((acc, curr) => {
						return { ...acc, [curr.user_id]: curr };
					}, {});
					return zip(
						this.userService.profiles$.pipe(
							// do not let a posible error to get lost because of zip operator
							catchError((error) => of(error))
						),
						of(files)
					);
				}),
				map(([students, files]: [(User | Error)[], object]) => {
					return students
						.map((student: User | Error) => {
							if (student instanceof Error) {
								// error expected to have uid
								// to be displayed in CSV file
								// TODO: find a better way to provide uid
								// uid may be poorly packed in error messsage as prefix ended with ":"
								if (student.message.includes(':')) {
									const [uid, msg] = student.message.split(':');
									this.errors.push({ 'User ID': uid, error: msg });
								} else {
									this.errors.push({ 'User ID': '-', error: student.message });
								}
								return;
							}

							const file_key = student.extras.clever ?? student.extras.clever_student_student ?? student.primary_email ?? null;
							const info = file_key ? files[file_key] : null;
							const file_name = info?.file.name;
							const student_number = file_key ?? '';
							const user = {
								...student,
								file_name,
								student_number,
							};
							return user;
						})
						.filter(Boolean);
				})
			)
			.subscribe((students) => {
				this.uploadedProfiles = students;
				this.allProfiles = cloneDeep(this.uploadedProfiles);
				this.page = 4;
			});

		this.userService.profilePicturesErrors$.pipe(takeUntil(this.destroy$)).subscribe((er) => {
			this.errors.push(er);
		});

		this.userService.profilePicturesErrorCancel$
			.asObservable()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					// forced to move to page 2
					this.page = 2;
					this.clearData();
				},
			});

		merge(of(this.userService.getUserSchool()), this.userService.getCurrentUpdatedSchool$().pipe(filter((s) => !!s)))
			.pipe(
				filter((r) => !!r),
				takeUntil(this.destroy$)
			)
			.subscribe((school) => {
				this.school = school;
			});

		if (this.page === 5) {
			this.userService.getMissingProfilePicturesRequest();
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	parseArrayToObject(array: any[]) {
		return array.reduce((acc, curr) => {
			return { ...acc, [curr.file_name]: curr };
		}, {});
	}

	getUploadedGroupTime(date: Date): string {
		return moment(date).format('MMM. DD, YYYY') + ' at ' + moment(date).format('hh:mm A');
	}

	nextPage() {
		this.page += 1;
		if (this.page === 3) {
			this.errors = this.findIssues();
			// filter duplicates and preserve sync of userId with file
			// it keeps the latest, order wise
			const uniques = new Map<string, File>();
			this.filesToDB.forEach((v: { user_id: string | number; file: File }) => uniques.set('' + v.user_id, v.file));
			const userIds = Array.from(uniques.keys());
			const files = Array.from(uniques.values());

			if (userIds.length && files.length) {
				this.userService
					.postProfilePicturesRequest(userIds, files)
					.pipe(
						filter((profiles) => !!profiles.length),
						take(1)
					)
					.subscribe((_) => {
						this.userService.putProfilePicturesErrorsRequest(this.errors);
					});
			} else {
				this.toastService.openToast({
					title: 'Sorry, no pictures could be mapped',
					subtitle:
						'No pictures were able to be mapped to account email addresses or IDs. Please check the spreadsheet and photos you uploaded to make sure they map with existing accounts.',
					type: 'error',
				});
				this.userService
					.createPPicturesUploadGroup()
					.pipe(
						filter((r) => !!r),
						take(1)
					)
					.subscribe((_) => {
						this.userService.putProfilePicturesErrorsRequest(this.errors);
						this.page = 2;
						this.clearData();
					});
			}
		} else if (this.page === 5) {
			this.userService.clearUploadedData();
			this.userService.getMissingProfilePicturesRequest();
			this.userService.getUploadedGroupsRequest();
		}
	}

	clearData() {
		this.selectedMapFiles = [];
		this.selectedImgFiles = [];
		this.errors = [];
		this.selectedMapFile = null;
		this.uploadedProfiles = [];
		this.allProfiles = [];
		this.filesToDB = [];
		this.uploadingProgress = {
			images: { inProcess: false, complete: false, error: null },
			csv: { inProcess: false, complete: false, error: null },
		};
		this.form.reset();
	}

	generateErrorsCsv() {
		this.xlsxService.generate(this.errors, 'Errors');
	}

	generateStudentsCsv(accounts: User[]) {
		const normalizeAccounts = accounts.map((account) => {
			return { Name: account.display_name, Email: account.primary_email };
		});
		this.xlsxService.generate(normalizeAccounts, 'Missing Pictures');
	}

	prepareErrorsToCsv(group) {
		this.userService
			.getUploadedErrorsRequest(group.id)
			.pipe(
				filter((res) => !!res.length),
				take(1),
				tap((errors) => {
					const parseErrors = errors.map((error) => {
						const errorMessage = error.message.split('=>')[1].trim();
						const userId = error.message.split(':')[1].split('=>')[0].trim();
						return { 'User ID': userId, error: errorMessage };
					});
					this.xlsxService.generate(parseErrors, 'Errors');
					this.userService.clearProfilePicturesErrors();
				})
			)
			.subscribe();
	}

	back() {
		if (this.dialog.getDialogById('student-info')) {
			this.dialogRef.close();
		}
		this.backEmit.emit();
	}

	findIssues() {
		const errors = [];
		for (let i = 0; i < this.selectedMapFiles.length; i++) {
			if (this.selectedMapFiles[i] instanceof Error) {
				errors.push({ Error: this.selectedMapFiles[i] });
				continue;
			}

			if (!this.selectedMapFiles[i].file_name) {
				errors.push({ 'User ID': this.selectedMapFiles[i].user_id, error: 'Image filename not listed' });
			} else if (!this.selectedMapFiles[i].user_id) {
				errors.push({ 'Image filename': this.selectedMapFiles[i].file_name, error: 'User ID not listed' });
			} else if (this.selectedMapFiles[i].file_name && !this.selectedImgFiles[this.selectedMapFiles[i].file_name]) {
				errors.push({ 'User ID': this.selectedMapFiles[i].user_id, error: 'No image found' });
			} else {
				this.filesToDB.push({ user_id: this.selectedMapFiles[i].user_id, file: this.selectedImgFiles[this.selectedMapFiles[i].file_name].file });
			}
		}
		return errors;
	}

	redirect(location: string) {
		window.open(location, '_blank');
	}

	genOption(display: string, color: string, action: string, icon?: string, hoverBackground?: string, clickBackground?: string) {
		return { display, color, action, icon, hoverBackground, clickBackground };
	}

	moveBackPage(): void {
		this.page -= 1;
		if (this.page === 2) {
			this.clearData();
		}
	}

	openConfirm(event: PointerEvent) {
		const options = [];
		options.push(this.genOption('Cancel', '#E32C66', 'cancel', './assets/Cancel (Red).svg', 'rgba(227, 44, 102, .1)'));
		const target = new ElementRef(event.currentTarget);
		const cm = this.dialog.open(ConsentMenuComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				header: 'Are you sure you want to cancel bulk uploading profile pictures? Your progress will be lost.',
				options: options,
				trigger: target,
			},
		});

		cm.afterClosed().subscribe((action) => {
			if (action === 'cancel') {
				this.moveBackPage();
			}
		});
	}

	searchUsers(search: string) {
		this.uploadedProfiles = this.allProfiles.filter((profile: User) => {
			return profile.display_name.toLowerCase().includes(search.toLowerCase());
		});
	}

	openSettings() {
		const settings = [
			{
				label: this.school.profile_pictures_enabled ? 'Disable profile pictures' : 'Enable profile pictures',
				icon: this.school.profile_pictures_enabled ? './assets/Stop (Blue-Gray).svg' : './assets/Check (Jade).svg',
				description: this.school.profile_pictures_enabled
					? 'Disabling profile pictures prevents admins and teachers from seeing profile pictures on pass tiles.'
					: 'Enabling profile pictures lets admins and teachers see profile pictures on pass tiles.',
				textColor: this.school.profile_pictures_enabled ? '#7f879d' : '#38c492',
				backgroundColor: this.school.profile_pictures_enabled ? '#F4F4F4' : '#d2f1e6',
				action: this.school.profile_pictures_enabled ? 'disable' : 'enable',
			},
		];
		UNANIMATED_CONTAINER.next(true);
		const st = this.dialog.open(SettingsDescriptionPopupComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { trigger: this.dots.nativeElement, settings, adjustForScroll: true },
		});

		st.afterClosed()
			.pipe(
				tap(() => UNANIMATED_CONTAINER.next(false)),
				filter((r) => !!r)
			)
			.subscribe((action) => {
				if (action === 'disable') {
					this.switchProfilePictures(false);
				} else {
					this.switchProfilePictures(true);
				}
			});
	}

	switchProfilePictures(value) {
		this.adminService
			.updateSchoolSettingsRequest(this.school, { profile_pictures_enabled: value })
			.pipe(
				filter((r) => !!r),
				takeUntil(this.destroy$)
			)
			.subscribe((r) => {
				this.toastService.openToast({
					title: value ? 'Profile pictures enabled' : 'Profile pictures disabled',
					type: value ? 'success' : 'info',
				});
			});
	}
}
