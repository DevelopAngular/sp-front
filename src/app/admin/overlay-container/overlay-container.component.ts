import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';

import {BehaviorSubject, forkJoin, fromEvent, merge, Observable, of, Subject, zip} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap,} from 'rxjs/operators';

import {NextStep} from '../../animations';
import {Pinnable} from '../../models/Pinnable';
import {Location} from '../../models/Location';
import {HttpService} from '../../services/http-service';
import {UserService} from '../../services/user.service';
import {HallPassesService} from '../../services/hall-passes.service';
import {LocationsService} from '../../services/locations.service';
import {OptionState, ValidButtons} from './advanced-options/advanced-options.component';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {FolderData, OverlayDataService, Pages, RoomData} from './overlay-data.service';
import {cloneDeep, differenceBy, filter as _filter, isString, pullAll} from 'lodash';
import {ColorProfile} from '../../models/ColorProfile';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss'],
  animations: [NextStep]

})
export class OverlayContainerComponent implements OnInit, OnDestroy {

  @ViewChild('block', { static: true }) block: ElementRef;

  currentPage: number;
  roomData: RoomData;
  folderData: FolderData;

  oldFolderData: FolderData;

  bulkEditData: {
    roomData: RoomData,
    rooms: Location[] | any[]
  };

  initialSettings = {
    icon: null,
    color: null
  };

  roomValidButtons = new BehaviorSubject<ValidButtons>({
      publish: false,
      incomplete: false,
      cancel: false
  });

  selectedRooms = [];
  pinnable: Pinnable;
  pinnables$: Observable<Pinnable[]>;
  overlayType: string;
  gradientColor: string;

  color_profile: ColorProfile;
  selectedIcon;

  pinnablesCollectionIds$: Observable<number[] | string[]>;

  icons$: Observable<any>;

  titleIcon: string;
  isDirtyColor: boolean;
  isDirtyIcon: boolean;

  folderRoomsLoaded: boolean;

  pinnableToDeleteIds: number[] = [];

  titleColor = 'white';

  form: FormGroup;
  passLimitForm: FormGroup;
  showErrors: boolean;

  showPublishSpinner: boolean;
  iconTextResult$: Subject<string> = new Subject<string>();
  showBottomShadow: boolean = true;

  advOptState: OptionState = {
      now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
      future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
  };
  frameMotion$: BehaviorSubject<any>;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      private userService: UserService,
      private http: HttpService,
      private locationService: LocationsService,
      private hallPassService: HallPassesService,
      private formService: CreateFormService,
      public sanitizer: DomSanitizer,
      public overlayService: OverlayDataService,
      private toast: ToastService
  ) {}

  getHeaderData() {
    let colors;
    switch (this.overlayType) {
        case 'newRoom':
          this.overlayService.changePage(Pages.NewRoom, 0, null);
          this.titleColor = '#1F195E';
          break;
        case 'newFolder':
            if (!!this.pinnable) {
                colors = this.pinnable.color_profile.gradient_color;
                this.overlayService.changePage(Pages.EditFolder, 0, {
                    pinnable: this.pinnable,
                });
                this.color_profile = this.pinnable.color_profile;
                this.selectedIcon = this.pinnable.icon;
                this.titleIcon = this.pinnable.icon;
                this.initialSettings = {
                  icon: cloneDeep(this.selectedIcon),
                  color: cloneDeep(this.color_profile)
                };
                break;
            }
          this.overlayService.changePage(Pages.NewFolder, 0, null);
          this.titleColor = '#1F195E';
          this.folderRoomsLoaded = true;
          break;
        case 'editRoom':
            this.overlayService.changePage(Pages.EditRoom, 0, {
                pinnable: this.pinnable,
                advancedOptions: this.generateAdvOptionsModel(this.pinnable.location)
            });
            colors = this.pinnable.color_profile.gradient_color;
            this.selectedIcon = this.pinnable.icon;
            this.titleIcon = this.pinnable.icon;
            this.color_profile = this.pinnable.color_profile;
            this.initialSettings = {
              icon: cloneDeep(this.selectedIcon),
              color: cloneDeep(this.color_profile)
            };
            break;
        case 'edit':
          this.overlayService.changePage(Pages.BulkEditRooms, 0, null);
          this.titleColor = '#1F195E';
          break;
    }
    this.currentPage = this.overlayService.pageState.getValue().currentPage;
      this.gradientColor = 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  get roomTitle() {
      if (this.currentPage === Pages.NewRoom ||
          this.currentPage === Pages.EditRoom) {
          return this.roomData ? this.roomData.roomName : null;
      } else {
          if (this.currentPage === Pages.BulkEditRooms) {
              return 'Bulk Edit Rooms';
          } else {
              return this.folderData ? this.folderData.folderName : null;
          }
      }
  }

  get disabledRightBlock() {
      return this.currentPage === Pages.NewRoomInFolder ||
          this.currentPage === Pages.EditRoomInFolder ||
          this.currentPage === Pages.ImportRooms ||
          this.currentPage === Pages.BulkEditRoomsInFolder ||
          this.currentPage === Pages.AddExistingRooms;
  }

  get isFormIncomplete() {
    if (this.currentPage === Pages.EditRoom || this.currentPage === Pages.NewRoom ||
        this.currentPage === Pages.NewFolder || this.currentPage === Pages.EditFolder ||
        this.currentPage === Pages.BulkEditRoomsInFolder) {
      if (this.isDirtyColor || this.isDirtyIcon) {
        return false;
      }
      if (!this.selectedIcon || !this.color_profile) {
        return true;
      }
    }

    if ((this.currentPage === Pages.EditRoom || this.currentPage === Pages.NewRoom ||
        this.currentPage === Pages.BulkEditRooms) && this.roomData !== undefined) {
      if ((this.roomData.advOptState.now.state === 'Certain \n teachers' &&
        this.roomData.advOptState.now.data.selectedTeachers.length === 0) ||
        (this.roomData.advOptState.future.state === 'Certain \n teachers' &&
          this.roomData.advOptState.future.data.selectedTeachers.length === 0)) {
        return true;
      }
    }

    return !this.roomValidButtons.getValue().publish;
  }

  get isAllowedSave() {
    return this.currentPage === Pages.NewRoom ||
      this.currentPage === Pages.EditRoom ||
      this.currentPage === Pages.NewFolder ||
      this.currentPage === Pages.EditFolder ||
      this.currentPage === Pages.BulkEditRooms;
  }

  get saveButtonToolTip() {
    if (this.isFormIncomplete) {
      let missing = [];

      if (this.currentPage === Pages.EditRoom || this.currentPage === Pages.NewRoom)
        if (this.form.get('roomName').invalid)
          missing.push('room name');
      if (this.currentPage === Pages.NewFolder || this.currentPage === Pages.EditFolder ||
          this.currentPage === Pages.BulkEditRoomsInFolder)
        if (this.form.get('folderName').invalid)
          missing.push('folder name');

      if (this.currentPage === Pages.EditRoom || this.currentPage === Pages.NewRoom ||
          this.currentPage === Pages.NewFolder || this.currentPage === Pages.EditFolder ||
          this.currentPage === Pages.BulkEditRoomsInFolder) {
        if (!this.selectedIcon)
          missing.push('icon');
        if (!this.color_profile)
          missing.push('color');
      }

      if (this.currentPage === Pages.EditRoom || this.currentPage === Pages.NewRoom) {
        if (this.form.get('roomNumber').invalid)
          missing.push('room number');
        if (this.form.get('timeLimit').invalid)
          missing.push('time limit');

        if (this.roomData !== undefined) {
          if (this.roomData.travelType.length === 0)
            missing.push('travel type');
          if (this.roomData.advOptState.now.state === 'Certain \n teachers' &&
              this.roomData.advOptState.now.data.selectedTeachers.length === 0)
            missing.push('restriction for now teachers');
          if (this.roomData.advOptState.future.state === 'Certain \n teachers' &&
              this.roomData.advOptState.future.data.selectedTeachers.length === 0)
            missing.push('restriction for future teachers');
        }
        if (this.passLimitForm.get('to').invalid && this.passLimitForm.get('toEnabled').value)
          missing.push('active pass limit');
      }

      if (this.currentPage === Pages.BulkEditRooms) {
        if (this.bulkEditData !== undefined && this.bulkEditData.roomData !== undefined) {
          if (this.bulkEditData.roomData.advOptState.now.state === 'Certain \n teachers' &&
              this.bulkEditData.roomData.advOptState.now.data.selectedTeachers.length === 0)
            missing.push('restriction for now teachers');
          if (this.bulkEditData.roomData.advOptState.future.state === 'Certain \n teachers' &&
              this.bulkEditData.roomData.advOptState.future.data.selectedTeachers.length === 0)
            missing.push('restriction for future teachers');
        }
        if (this.passLimitForm.get('to').invalid && this.passLimitForm.get('toEnabled').value)
          missing.push('pass limit');
      }

      if (missing.length === 1)
        return 'Missing ' + missing[0];
      if (missing.length === 2)
        return `Missing ${missing[0]} and ${missing[1]}`;
      if (missing.length !== 0)
        return `Missing ${missing.slice(0, missing.length - 1).join(', ')}, and ${missing[missing.length - 1]}`;
    }


    if (this.showPublishSpinner)
      return 'Please wait, rooms are still being uploaded.';

    return null;
  }

  get showIncompleteButton() {
    // if (this.currentPage === Pages.BulkEditRooms) {
    //   return this.roomValidButtons.getValue().incomplete;
    // } else {
    //   return (this.roomValidButtons.getValue().incomplete ||
    //     !this.selectedIcon || !this.color_profile) && this.showCancelButton;
    // }
    return false;
  }

  get showCancelButton() {
      return (this.roomValidButtons.getValue().cancel || this.isDirtyIcon || this.isDirtyColor) && !this.disabledRightBlock;
  }

  ngOnInit() {
    // this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.pinnablesCollectionIds$ = this.hallPassService.pinnablesCollectionIds$;
    this.overlayService.pageState.pipe(filter(res => !!res)).subscribe(res => {
       this.currentPage = res.currentPage;
    });

      this.overlayType = this.dialogData['type'];
      if (this.dialogData['pinnable']) {
        this.pinnable = this.dialogData['pinnable'];
      }
      if (this.dialogData['rooms']) {
        this.pinnableToDeleteIds = this.dialogData['rooms'].map(pin => +pin.id);
        this.selectedRooms = this.dialogData['rooms'];
      }

    if (this.dialogData['forceSelectedLocation']) {
      this.setToEditRoom(this.dialogData['forceSelectedLocation']);
    }

      if (this.dialogData['pinnables$']) {
          this.pinnables$ = this.dialogData['pinnables$'];

          this.pinnables$ = this.pinnables$.pipe(map(pinnables => {
              const filterLocations = _filter<Pinnable>(pinnables, {type: 'location'});
              const locationsIds = filterLocations.map(item => item.location.id);
              const currentLocationsIds = this.selectedRooms.map(room => {
                  if (room.type && room.type === 'location') {
                      return room.location.id;
                  }
                  if (!room.type) {
                      return room.id;
                  }
              });
              return filterLocations.filter(item => {
                  return item.location.id === pullAll(locationsIds, currentLocationsIds).find(id => item.location.id === id);
              });
          }));

      }

      this.getHeaderData();
      this.buildForm();

      if (this.currentPage === Pages.EditFolder || this.currentPage === Pages.EditRoom || this.currentPage === Pages.EditRoomInFolder) {
          this.icons$ = merge(
              this.form.get('roomName').valueChanges,
              this.form.get('folderName').valueChanges
          )
              .pipe(
                  debounceTime(300),
                  distinctUntilChanged(),
                  filter(search => search),
                  switchMap((search) => {
                    return this.http.searchIcons(search.toLowerCase());
                  })
              );
      } else {
          this.icons$ = merge(
              this.overlayService.roomNameBlur$,
              this.overlayService.folderNameBlur$
          ).pipe(
              filter(value => !!value),
              switchMap((value: string) => {
                return this.http.searchIcons(value.toLowerCase())
                  .pipe(
                    tap((res: any[]) => {
                      if (!res) {
                        this.iconTextResult$.next('No results');
                      }
                    })
                  );
              })
          );
      }
    this.dialogRef.backdropClick()
      .pipe(
        switchMap(() => {
          return this.roomValidButtons;
        }),
        filter((rvb: ValidButtons): boolean => {
          return Object.values(rvb).every(v => !v);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
      this.dialogRef.close();
    });

      fromEvent(this.block.nativeElement, 'scroll').pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
        if (res.target.offsetHeight + res.target.scrollTop >= res.target.scrollHeight) {
          this.showBottomShadow = false;
        } else {
          this.showBottomShadow = true;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm() {
    this.form = new FormGroup({
        file: new FormControl(),
        roomName: new FormControl('',
            [Validators.required, Validators.maxLength(15)],
            this.uniqueRoomNameValidator.bind(this)
        ),
        folderName: new FormControl('',
            [Validators.required, Validators.maxLength(17)],
            this.uniqueFolderNameValidator.bind(this)
        ),
        roomNumber: new FormControl('',
            [Validators.required, Validators.maxLength(5)]),
        timeLimit: new FormControl('', [
            Validators.required,
            Validators.pattern('^[0-9]*?[0-9]+$'),
            Validators.min(1),
            Validators.max(120)
            ]
        )
    });

    this.passLimitForm = new FormGroup({
      fromEnabled: new FormControl(
        (this.pinnable && this.pinnable.location ? this.pinnable.location.max_passes_from_active : false)
      ),
      from: new FormControl(
        (this.pinnable && this.pinnable.location ? '' + this.pinnable.location.max_passes_from : ''),
        [Validators.required, Validators.pattern('^[0-9]*?[0-9]+$')]
      ),
      toEnabled: new FormControl(
        (this.pinnable && this.pinnable.location ? this.pinnable.location.max_passes_to_active : false)
      ),
      to: new FormControl(
        (this.pinnable && this.pinnable.location ? '' + this.pinnable.location.max_passes_to : ''),
        [Validators.required, Validators.pattern('^[0-9]*?[0-9]+$')]
      )
    });
  }

  generateAdvOptionsModel(loc: Location) {
      if (loc.request_mode === 'teacher_in_room' || loc.request_mode === 'all_teachers_in_room') {

          const mode = loc.request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

          if (loc.request_send_destination_teachers && loc.request_send_origin_teachers) {
              this.advOptState.now.data[mode] = 'Both';
          } else if (loc.request_send_destination_teachers) {
              this.advOptState.now.data[mode] = 'This Room';
          } else if (loc.request_send_origin_teachers) {
              this.advOptState.now.data[mode] = 'Origin';
          }
      } else if (loc.request_mode === 'specific_teachers') {
          this.advOptState.now.data.selectedTeachers = loc.request_teachers;
      }
      if (loc.scheduling_request_mode === 'teacher_in_room' || loc.scheduling_request_mode === 'all_teachers_in_room') {

          const mode = loc.scheduling_request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

          if (loc.scheduling_request_send_destination_teachers && loc.scheduling_request_send_origin_teachers) {
              this.advOptState.future.data[mode] = 'Both';
          } else if (loc.scheduling_request_send_destination_teachers) {
              this.advOptState.future.data[mode] = 'This Room';
          } else if (loc.scheduling_request_send_origin_teachers) {
              this.advOptState.future.data[mode] = 'Origin';
          }
      } else if (loc.scheduling_request_mode === 'specific_teachers') {
          this.advOptState.future.data.selectedTeachers = loc.scheduling_request_teachers;
      }

      if (loc.request_mode === 'any_teacher') {
          this.advOptState.now.state = 'Any teacher';
      } else if (loc.request_mode === 'teacher_in_room') {
          this.advOptState.now.state = 'Any teachers in room';
      } else if (loc.request_mode === 'all_teachers_in_room') {
          this.advOptState.now.state = 'All teachers in room';
      } else if (loc.request_mode === 'specific_teachers') {
          this.advOptState.now.state = 'Certain \n teachers';
      }
      if (loc.scheduling_request_mode === 'any_teacher') {
          this.advOptState.future.state = 'Any teacher';
      } else if (loc.scheduling_request_mode === 'teacher_in_room') {
          this.advOptState.future.state = 'Any teachers in room';
      } else if (loc.scheduling_request_mode === 'all_teachers_in_room') {
          this.advOptState.future.state = 'All teachers in room';
      } else if (loc.scheduling_request_mode === 'specific_teachers') {
          this.advOptState.future.state = 'Certain \n teachers';
      }
      return this.advOptState;
  }

  uniqueRoomNameValidator(control: AbstractControl) {
      if (control.dirty) {
        return this.locationService.checkLocationName(control.value)
          .pipe(
            filter(() => this.currentPage !== Pages.NewFolder && this.currentPage !== Pages.EditFolder),
            map((res: any) => {
              if (this.currentPage === Pages.NewRoom || this.currentPage === Pages.NewRoomInFolder) {
                return res.title_used ? { room_name: true } : null;
              } else {
                let currentRoomName: string;
                if (this.currentPage === Pages.EditRoomInFolder || this.currentPage === Pages.NewRoomInFolder) {
                  currentRoomName = this.overlayService.pageState.getValue().data.selectedRoomsInFolder[0].title;
                } else {
                  currentRoomName = this.pinnable.location.title;
                }
                return res.title_used && (currentRoomName !== this.roomData.roomName) ? { room_name: true } : null;
              }
            }));
      } else {
          return of(null);
      }
  }

  uniqueFolderNameValidator(control: AbstractControl) {
    if (control.dirty) {
      return this.hallPassService.checkPinnableName(control.value)
        .pipe(map((res: any) => {
          if (this.currentPage === Pages.NewFolder) {
            return res.title_used ? { folder_name: true } : null;
          }
          return res.title_used && this.pinnable.title !== this.folderData.folderName ? { folder_name: true } : null;
        }));
    } else {
      return of(null);
    }
  }

  changeColor(color) {
    if (this.currentPage === Pages.EditRoom || this.currentPage === Pages.EditFolder) {
      this.isDirtyColor = this.initialSettings.color.id !== color.id;
    }
    this.color_profile = color;
    this.titleColor = 'white';
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + color.gradient_color + ')';
  }

  changeIcon(icon) {
    if (this.currentPage === Pages.EditRoom || this.currentPage === Pages.EditFolder) {
      this.isDirtyIcon = this.initialSettings.icon !== icon.inactive_icon;
    }
    this.selectedIcon = icon;
    this.titleIcon = icon.inactive_icon;
  }

  normalizeAdvOptData(roomData = this.roomData) {
      const data: any = {};
      if (roomData.advOptState.now.state === 'Any teacher') {
          data.request_mode = 'any_teacher';
          data.request_send_origin_teachers = true;
          data.request_send_destination_teachers = true;
      } else if (roomData.advOptState.now.state === 'Any teachers in room') {
          data.request_mode = 'teacher_in_room';
      } else if (roomData.advOptState.now.state === 'All teachers in room') {
          data.request_mode = 'all_teachers_in_room';
      } else if (roomData.advOptState.now.state === 'Certain \n teachers') {
          data.request_mode = 'specific_teachers';
      }
      if (roomData.advOptState.future.state === 'Any teacher') {
          data.scheduling_request_mode = 'any_teacher';
          data.scheduling_request_send_origin_teachers = true;
          data.scheduling_request_send_destination_teachers = true;
      } else if (roomData.advOptState.future.state === 'Any teachers in room') {
          data.scheduling_request_mode = 'teacher_in_room';
      } else if (roomData.advOptState.future.state === 'All teachers in room') {
          data.scheduling_request_mode = 'all_teachers_in_room';
      } else if (roomData.advOptState.future.state === 'Certain \n teachers') {
          data.scheduling_request_mode = 'specific_teachers';
      }
      if (roomData.advOptState.now.data.any_teach_assign === 'Both' || roomData.advOptState.now.data.all_teach_assign === 'Both') {
          data.request_send_origin_teachers = true;
          data.request_send_destination_teachers = true;
      } else if (roomData.advOptState.now.data.any_teach_assign === 'Origin' || roomData.advOptState.now.data.all_teach_assign === 'Origin') {
          data.request_send_origin_teachers = true;
          data.request_send_destination_teachers = false;
      } else if (roomData.advOptState.now.data.any_teach_assign === 'This Room' || roomData.advOptState.now.data.all_teach_assign === 'This Room') {
          data.request_send_destination_teachers = true;
          data.request_send_origin_teachers = false;
      } else if (roomData.advOptState.now.data.selectedTeachers.length) {
          data.request_teachers = roomData.advOptState.now.data.selectedTeachers.map(t => t.id);
      }
      if (roomData.advOptState.future.data.any_teach_assign === 'Both' || roomData.advOptState.future.data.all_teach_assign === 'Both') {
          data.scheduling_request_send_origin_teachers = true;
          data.scheduling_request_send_destination_teachers = true;
      } else if (roomData.advOptState.future.data.all_teach_assign === 'Origin' || roomData.advOptState.future.data.any_teach_assign === 'Origin') {
          data.scheduling_request_send_origin_teachers = true;
          data.scheduling_request_send_destination_teachers = false;
      } else if (roomData.advOptState.future.data.all_teach_assign === 'This Room' || roomData.advOptState.future.data.any_teach_assign === 'This Room') {
          data.scheduling_request_send_destination_teachers = true;
          data.scheduling_request_send_origin_teachers = false;
      } else if (roomData.advOptState.future.data.selectedTeachers.length) {
          data.scheduling_request_teachers = roomData.advOptState.future.data.selectedTeachers.map(t => t.id);
      }
      return data;
  }

  back(closeDialog: boolean = true) {
    if (closeDialog) {
      this.dialogRef.close();
    } else {
      this.formService.setFrameMotionDirection('back');
      setTimeout(() => {
        const oldFolderData = this.oldFolderData ? this.oldFolderData : this.folderData;
        if (this.overlayService.pageState.getValue().previousPage === Pages.BulkEditRoomsInFolder) {
          if (!!this.pinnable) {
            this.overlayService.changePage(Pages.EditFolder, this.currentPage, {...this.folderData, oldFolderData});
          } else {
            this.overlayService.changePage(Pages.NewFolder, this.currentPage, {...this.folderData, oldFolderData});
          }
        } else {
          this.overlayService.back({...this.folderData, oldFolderData});
        }
      }, 100);
    }
  }

  showFormErrors() {
    if (this.form.get('roomName').invalid) {
      this.form.get('roomName').markAsDirty();
      this.form.get('roomName').setErrors(this.form.get('roomName').errors);
    }
    if (this.form.get('roomNumber').invalid) {
      this.form.get('roomNumber').markAsDirty();
      this.form.get('roomNumber').setErrors(this.form.get('roomNumber').errors);
    }
    if (this.form.get('timeLimit').invalid) {
      this.form.get('timeLimit').markAsDirty();
      this.form.get('timeLimit').setErrors(this.form.get('timeLimit').errors);
    }
    if (this.passLimitForm.get('fromEnabled').value && this.passLimitForm.get('from').invalid) {
      this.passLimitForm.get('from').markAsDirty();
      this.passLimitForm.get('from').setErrors(this.passLimitForm.get('from').errors);
    }
    if (this.passLimitForm.get('toEnabled').value && this.passLimitForm.get('to').invalid) {
      this.passLimitForm.get('to').markAsDirty();
      this.passLimitForm.get('to').setErrors(this.passLimitForm.get('to').errors);
    }
    this.showErrors = true;
  }

  onPublish() {
    this.showPublishSpinner = true;

    if (this.currentPage === Pages.NewRoom) {
       const location = {
                title: this.roomData.roomName,
                room: this.roomData.roomNumber,
                restricted: !!this.roomData.restricted,
                scheduling_restricted: !!this.roomData.scheduling_restricted,
                teachers: this.roomData.selectedTeachers.map(teacher => teacher.id),
                travel_types: this.roomData.travelType,
                max_allowed_time: +this.roomData.timeLimit,
                max_passes_from: +this.passLimitForm.get('from').value,
                max_passes_from_active: this.passLimitForm.get('fromEnabled').value,
                max_passes_to: this.passLimitForm.get('to').valid ? +this.passLimitForm.get('to').value : 0,
                max_passes_to_active: this.passLimitForm.get('toEnabled').value && this.passLimitForm.get('to').valid,
                ...this.normalizeAdvOptData()
        };
       this.locationService.createLocationRequest(location)
           .pipe(
             filter(res => !!res),
             take(1),
             switchMap((loc: Location) => {
               const pinnable = {
                   title: this.roomData.roomName,
                   color_profile: this.color_profile.id,
                   icon: this.selectedIcon.inactive_icon,
                   location: loc.id,
               };
               return this.hallPassService.postPinnableRequest(pinnable);
              }),
             takeUntil(this.destroy$)
           )
         .subscribe(response => {
           this.toast.openToast({title: 'New room added', type: 'success'});
           this.dialogRef.close(true);
         });
    }

    if (this.currentPage === Pages.NewFolder || this.currentPage === Pages.EditFolder) {
      const salt = ' ' + this.generateRandomString();
      if (!this.folderData.roomsInFolder.length) {
        const newFolder = {
          title: this.folderData.folderName,
          color_profile: this.color_profile.id,
          icon: this.selectedIcon.inactive_icon,
          category: this.folderData.folderName + salt
        };
        if (this.pinnable) {
          this.hallPassService.updatePinnableRequest(this.pinnable.id, newFolder).pipe(takeUntil(this.destroy$))
            .subscribe(res => this.dialogRef.close(true));
        }
      }
      if (this.folderData.roomsToDelete.length) {
        const deleteRequest$ = this.folderData.roomsToDelete.map(room => {
          return this.locationService.deleteLocationRequest(room.id).pipe(filter(res => !!res));
        });

        forkJoin(deleteRequest$).pipe(takeUntil(this.destroy$)).subscribe();
      }
      let locationsToDb$;
      const touchedRooms = this.folderData.roomsInFolder.filter(room => room.isEdit || !room.category);

      if (touchedRooms.length) {
        locationsToDb$ = touchedRooms.map(location => {
          let id;
          let data;
          if (isString(location.id)) {
            location.category = this.folderData.folderName + salt;
            location.teachers = location.teachers.map(t => t.id);
            return this.locationService.createLocation(location);
          } else {
            id = location.id;
            data = location;
            data.category = this.folderData.folderName + salt;
            // debugger;
            if (!data.max_passes_to_active && data.enable_queue) {
              data.max_passes_to_active = true;
            }
            if (data.teachers) {
              data.teachers = data.teachers.map(teacher => +teacher.id);
            }

            return this.locationService.updateLocation(id, data);
          }
        });
      } else {
        locationsToDb$ = [of(null)];
      }

      zip(...locationsToDb$).pipe(
        switchMap(locations => {
          const newFolder = {
            title: this.folderData.folderName,
            color_profile: this.color_profile.id,
            icon: this.selectedIcon.inactive_icon,
            category: this.folderData.folderName + salt
          };
          if (this.currentPage === Pages.EditFolder) {
            this.hallPassService.updatePinnableRequest(this.pinnable.id, newFolder);
            return of(null);
          } else {
            return zip(
              this.hallPassService.pinnables$.pipe(take(1)),
              this.hallPassService.postPinnableRequest(newFolder).pipe(filter(res => !!res)),
            ).pipe(
              switchMap((result: any[]) => {
                const arrengedSequence = result[0].map(item => item.id);
                arrengedSequence.push(result[1].id);
                return this.hallPassService.createArrangedPinnableRequest( { order: arrengedSequence.join(',')});
              })
            );
          }
      }),
        switchMap((res) => {
          if (this.pinnableToDeleteIds.length) {
            const deleteRequests = this.pinnableToDeleteIds.map(id => {
              return this.hallPassService.deletePinnableRequest(id);
            });
            return zip(...deleteRequests);
          } else {
            return of(null);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.toast.openToast({title: this.currentPage === Pages.NewFolder ? 'New folder added' : 'Folder updated', type: 'success'});
        this.dialogRef.close(true);
      });
    }

    if (this.currentPage === Pages.EditRoom) {
        const location = {
            title: this.roomData.roomName,
            room: this.roomData.roomNumber,
            restricted: !!this.roomData.restricted,
            scheduling_restricted: !!this.roomData.scheduling_restricted,
            teachers: this.roomData.selectedTeachers.map(teacher => teacher.id),
            travel_types: this.roomData.travelType,
            max_allowed_time: +this.roomData.timeLimit,
            max_passes_from: +this.passLimitForm.get('from').value,
            max_passes_from_active: this.passLimitForm.get('fromEnabled').value,
            max_passes_to: this.passLimitForm.get('to').valid ? +this.passLimitForm.get('to').value : 0,
            max_passes_to_active: this.passLimitForm.get('toEnabled').value && this.passLimitForm.get('to').valid,
        };

        const mergedData = {...location, ...this.normalizeAdvOptData()};

        this.locationService.updateLocationRequest(this.pinnable.location.id, mergedData)
            .pipe(
              filter(res => !!res),
              take(1),
              switchMap((loc: Location) => {
                const pinnable = {
                    title: this.roomData.roomName,
                    color_profile: this.color_profile.id,
                    icon: this.selectedIcon.inactive_icon,
                    location: loc.id,
                };
                return this.hallPassService.updatePinnableRequest(this.pinnable.id, pinnable);
            })).pipe(takeUntil(this.destroy$)).subscribe(response => {
              this.toast.openToast({title: 'Room updated', type: 'success'});
              this.dialogRef.close(true);
        });
    }

    if (this.currentPage === Pages.BulkEditRooms) {
      const patchRequests$ = (this.bulkEditData.rooms as Location[]).map(room => {
        const data = {
          ...room,
          teachers: room.teachers.map(t => t.id)
        };
        return this.locationService.updateLocationRequest(room.id, data).pipe(
          filter(res => !!res));
      });

      zip(...patchRequests$).pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.toast.openToast({title: 'Rooms updated', type: 'success'});
        this.dialogRef.close(true);
      });
    }
  }

  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#555558');
    }
  }

  getBackground(item) {
    if (item.hovered) {
        return '#F7F7F7';
    } else {
      return '#F7F7F7';
    }
  }

  handleDragEvent( evt: DragEvent, dropAreaColor: string) {
    evt.preventDefault();
    this.overlayService.dragEvent$.next(dropAreaColor);
  }

  roomResult({data, buttonState}) {
    this.roomData = data;
    this.roomValidButtons.next(buttonState);
  }

  folderResult({data, buttonState}) {
      this.folderData = data;
      this.roomValidButtons.next(buttonState);
  }

  newRoomInFolder(room: RoomData) {
      this.oldFolderData = cloneDeep(this.folderData);
      this.folderData.roomsInFolder.push({
        ...this.normalizeRoomData(room),
        ...this.normalizeAdvOptData(room),
        isEdit: true
      });
      this.form.get('roomName').reset();
      this.form.get('roomNumber').reset();
      this.form.get('timeLimit').reset();
      this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData, pinnable: this.pinnable});
  }

  editRoomFolder(room: RoomData) {
    this.oldFolderData = cloneDeep(this.folderData);
    this.folderData.roomsInFolder = this.folderData.roomsInFolder.filter(r => r.id !== room.id);
    this.folderData.roomsInFolder.push({
      ...this.normalizeRoomData(room),
      ...this.normalizeAdvOptData(room),
      isEdit: true
    });
    this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData, pinnable: this.pinnable});
  }

  addToFolder(rooms: any[]) {
    this.oldFolderData = cloneDeep(this.folderData);
    this.pinnableToDeleteIds = rooms.map(pin => +pin.id);
    const locationsToAdd = rooms.map(room => {
      return {
        ...room.location,
        isEdit: true
      };
    });
    this.folderData.roomsInFolder = [...locationsToAdd, ...this.folderData.roomsInFolder];
    this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData});
  }

  bulkEditInFolder({roomData, rooms}) {
    this.oldFolderData = cloneDeep(this.folderData);
    this.folderData.roomsInFolder = differenceBy(this.folderData.roomsInFolder, rooms, 'id');
    const editingRooms = this.editRooms(roomData, rooms);
    this.folderData.roomsInFolder = [...editingRooms, ...this.folderData.roomsInFolder];
    if (this.overlayService.pageState.getValue().previousPage === Pages.ImportRooms) {
      if (!!this.pinnable) {
        this.overlayService.changePage(Pages.EditFolder, this.currentPage, {...this.folderData, oldFolderData: this.oldFolderData});
      } else {
        this.overlayService.changePage(Pages.NewFolder, this.currentPage, {...this.folderData, oldFolderData: this.oldFolderData});
      }
    } else {
      this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData});
    }
  }

  bulkEditResult({roomData, rooms, buttonState}) {
    const editingRooms = this.editRooms(roomData, rooms);
    this.bulkEditData = {roomData, rooms: editingRooms};
    this.roomValidButtons.next(buttonState);
  }

  deleteRoomInFolder(room) {
    this.oldFolderData = cloneDeep(this.folderData);
    if (!isString(room.id)) {
      this.folderData.roomsToDelete.push(room);
    }
    this.folderData.roomsInFolder = this.folderData.roomsInFolder.filter(r => r.id !== room.id);
    this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData});
  }

  editRooms(roomData, rooms) {
    return rooms.map(room => {
      room.restricted = !!roomData.restricted;
      room.scheduling_restricted = !!roomData.scheduling_restricted;
      if (roomData.travelType.length) {
        room.travelType = roomData.travelType;
      }

      if (roomData.timeLimit) {
        room.timeLimit = roomData.timeLimit;
      } else {
        room.timeLimit = room.max_allowed_time;
      }

      room.roomName = room.title;
      room.roomNumber = room.room;
      room.selectedTeachers = room.teachers;
      room.max_passes_to_active = roomData.advOptState.toEnabled;
      room.max_passes_to = roomData.advOptState.to;

      return {
        ...this.normalizeRoomData(room),
        ...this.normalizeAdvOptData(roomData),
        isEdit: true
      };
    });
  }

  normalizeRoomData(room) {
    return {
      id: room.id,
      title: room.roomName,
      room: room.roomNumber,
      restricted: !!room.restricted,
      scheduling_restricted: !!room.scheduling_restricted,
      teachers: room.selectedTeachers,
      travel_types: room.travelType,
      max_allowed_time: +room.timeLimit,
      max_passes_from: +this.passLimitForm.get('from').value,
      max_passes_from_active: false,
      max_passes_to: +this.passLimitForm.get('to').value,
      max_passes_to_active: !!this.passLimitForm.get('toEnabled').value
    };
  }

  generateRandomString() {
    let random: string = '';
    const characters = 'qwertyu';
    for (let i = 0; i < characters.length; i++) {
      random += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return random;
  }

  catchFile(evt: DragEvent) {
    evt.preventDefault();
    this.overlayService.dropEvent$.next(evt);
  }

  setToEditRoom(_room) {
    setTimeout(() => {
      this.overlayService.changePage(Pages.EditRoomInFolder, 1, {
        selectedRoomsInFolder: [_room]
      });
    }, 10);
  }
}
