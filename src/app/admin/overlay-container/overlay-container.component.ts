import {Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {BehaviorSubject, forkJoin, fromEvent, merge, Observable, of, Subject, zip} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Pinnable } from '../../models/Pinnable';
import * as _ from 'lodash';
import { User } from '../../models/User';
import { HttpService } from '../../services/http-service';
import { Location } from '../../models/Location';
import * as XLSX from 'xlsx';
import { UserService } from '../../services/user.service';
import { disableBodyScroll } from 'body-scroll-lock';
import {HallPassesService} from '../../services/hall-passes.service';
import {LocationsService} from '../../services/locations.service';
import {DomSanitizer} from '@angular/platform-browser';
import {filter} from 'rxjs/internal/operators';
import {OptionState} from './advanced-options/advanced-options.component';

export interface FormState {
    roomName?: string;
    folderName?: string;
    roomNumber: string | number;
    restricted: boolean;
    scheduling_restricted: boolean;
    travel_type: string[];
    teachers: number[];
    color?: number;
    icon?: string;
    timeLimit: number;
    advOptState?: OptionState;
}

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss'],
})
export class OverlayContainerComponent implements OnInit {

  public roomList: {
    domElement: ElementRef,
    ready: Subject<ElementRef>,
    topScroll: number
  } = {
    domElement: null,
    ready: new Subject<ElementRef>(),
    topScroll: 0
  };

  public isActiveIcon = {
    teachers: false,
    travel: false,
    timeLimit: false,
    restriction: false,
    scheduling_restricted: false
  };

  public tooltipText = {
    teachers: 'Which teachers should see pass activity in this room?',
    travel: 'Will the the room will be available to make only round-trip passes, only one-way passes, or both?',
    timeLimit: 'What is the maximum time limit that a student can make the pass for themselves?',
    restriction: 'Does the pass need digital approval from a teacher to become an active pass?',
    scheduling_restricted: 'Does the pass need digital approval from a teacher to become a scheduled pass?'
  };

  @ViewChild('roomList') set content(content: ElementRef) {
    this.roomList.domElement = content;
    if (this.roomList.domElement) {
      this.roomList.ready.next(this.roomList.domElement);
    }
  }
  @ViewChild('dropArea') dropArea: ElementRef;

  @ViewChild('file') set fileRef(fileRef: ElementRef) {
    // selectedFile
    if (fileRef && fileRef.nativeElement) {
      console.log(this.selectedFile);
      this.selectedFile = fileRef;
      fromEvent(this.selectedFile.nativeElement , 'change')
        .pipe(
          switchMap((evt: Event) => {
            // this.setLocation('settingsRooms');
            this.uploadingProgress.inProgress = true;

            const FR = new FileReader();
            FR.readAsBinaryString(this.selectedFile.nativeElement.files[0]);
            return fromEvent(FR, 'load');
          }),
          map(( res: any) => {
            const raw = XLSX.read(res.target.result, {type: 'binary'});
            const sn = raw.SheetNames[0];
            const stringCollection = raw.Sheets[sn];
            const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
            let rows = data.slice(1);
            rows = rows.map((row, index) => {
              const _room: any = {};
              _room.title = row[0];
              _room.room = row[1];
              _room.teachers = <string>row[2] ? row[2].split(', ') : [];
              return _room;
            });
            return rows;
          }),
          map((rows) => {
            rows = rows.map((r: any) => {
              if (r.title && r.title.length > 16) {
                r.title = r.title.slice(0, 15);
              }
              if (r.room && (r.room + '').length > 8) {
                r.title = r.title.slice(0, 7);
              }
              return r;
            });
            const groupedRooms = _.groupBy(rows, (r: any) => r.title);
            let normalizedRooms = [];
            console.log(groupedRooms);

            for (const key in groupedRooms) {
              if (groupedRooms[key].length > 1) {
                normalizedRooms = normalizedRooms.concat(
                  groupedRooms[key].map((duplicate: any, index: number) => {
                    duplicate.title = duplicate.title + ++index;
                    return duplicate;
                  })
                );
              } else {
                normalizedRooms = normalizedRooms.concat(groupedRooms[key]);
              }
            }
            console.log(normalizedRooms);
            return normalizedRooms;
          }),
          switchMap((_rooms: any[]): Observable<any[]> => {
            console.log(_rooms)
            return this.userService.getUsersList('_profile_teacher')
              .pipe(
                map((teachers: any[]) => {

                  return _rooms.map((_room) => {
                    const teachersIdArray = [];
                    const unknownArray = [];

                    _room.teachers.forEach((_teacherEmail) => {
                      const existAndAttached = teachers.find(_teacher =>  _teacher.primary_email === _teacherEmail );
                      if (existAndAttached) {
                        teachersIdArray.push(existAndAttached.id);
                      } else {
                        this.unknownEmails.push({
                          room: _room,
                          email: _teacherEmail
                        });
                      }
                    });

                    _room.teachers = teachersIdArray;
                    return _room;
                  });
                }));
          }),
        )
        .subscribe((rooms) => {
          console.log(rooms);
          console.log(this.unknownEmails);
          setTimeout(() => {
            this.uploadingProgress.inProgress = false;
            this.uploadingProgress.completed = true;
          }, 1500);
          this.importedRooms = rooms;
        });
    }
  }

  selectedFile: ElementRef;
  selectedRooms = [];
  selectedRoomsInFolder: Pinnable[] = [];
  selectedTeachers: User[] = [];
  selectedTeachersUntouched: User[];
  readyRoomsToEdit: Pinnable[] = [];
  pinnable: Pinnable;
  pinnables$: Observable<Pinnable[]>;
  currentLocationInEditRoomFolder;
  overlayType: string;
  roomName: string;
  folderName: string;
  roomNumber: string | number;
  timeLimit: string | number;
  travelType: string[];
  nowRestriction: boolean;
  futureRestriction: boolean;
  gradientColor: string;
  hideAppearance: boolean = false;
  isEditRooms: boolean = false;
  isEditFolder: boolean = false;
  editRoomInFolder: boolean;
  roomToEdit: Location;
  importedRooms: any[] = [];

  color_profile;
  selectedIcon;

  icons$: Observable<any>;

  titleIcon: string;

  initialState: FormState;
  isFormStateDirty: boolean;

  bulkWarningText: boolean;
  isDirtysettings: boolean;
  isDirtyTravel: boolean;
  isDirtyNowRestriction: boolean;
  isDirtyFutureRestriction: boolean;
  isDirtyColor: boolean;
  isDirtyIcon: boolean;
  isDirtyAdvancedOpt: boolean;

  isChangeState: boolean;
  isChangeStateInFolder: boolean;

  isChangeLocations = new BehaviorSubject<boolean>(false);

  advOptValid: boolean;

  showSearchTeacherOptions: boolean;

  newRoomsInFolder = [];

  folderRoomsLoaded: boolean;

  pinnableToDeleteIds: number[] = [];

  titleColor: string = 'white';

  form: FormGroup;

  showPublishSpinner: boolean;
  showDoneSpinner: boolean;

  hideDeleteButton: boolean;
  showProfileSearch: boolean = false;

  advOptState: OptionState = {
      now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
      future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
  };

  buttonsInFolder = [
      { title: 'New Room', icon: './assets/Plus (White).svg', location: 'newRoomInFolder'},
      { title: 'Import Rooms', icon: null, location: 'importRooms'},
      { title: 'Add Existing', icon: null, location: 'addExisting'}
  ];
  buttonsWithSelectedRooms = [
      { title: 'Bulk Edit Rooms', action: 'edit', color: '#FFFFFF, #FFFFFF', textColor: '#1F195E', hover: '#FFFFFF'},
      { title: 'Remove From Folder', action: 'remove_from_folder', textColor: '#1F195E', color: '#FFFFFF, #FFFFFF', hover: '#FFFFFF'},
      { title: 'Delete Rooms', action: 'delete', textColor: '#FFFFFF', color: '#DA2370,#FB434A', hover: '#DA2370'}
  ];

  unknownEmails: any[] = [];
  uploadingProgress: {
    inProgress: boolean,
    completed: boolean,
    percent: number
  } = {
    inProgress: false,
    completed: false,
    percent: 0
};


  @HostListener('scroll', ['$event'])
  onScroll(event) {
      // console.log(event.target.scrollTop);
  }

  constructor(
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
      private userService: UserService,
      private http: HttpService,
      private locationService: LocationsService,
      private hallPassService: HallPassesService,
      private elRef: ElementRef,
      public sanitizer: DomSanitizer

  ) {
    // this.selectedTeachersUntouched = _.cloneDeep(this.selectedTeachers);
    // this.selectedTeachersUntouched.splice(0, 1);
    // console.log(_.isEqual(this.selectedTeachers, this.selectedTeachersUntouched), this.selectedTeachers, this.selectedTeachersUntouched);
  }

  getHeaderData() {
    let colors;
    switch (this.overlayType) {
        case 'newRoom':
          this.titleColor = '#1F195E';
          this.roomName = 'New Room';
          break;
        case 'newFolder':
            if (!!this.pinnable) {
                colors = this.pinnable.color_profile.gradient_color;
                this.folderName = this.pinnable.title;
                this.color_profile = this.pinnable.color_profile;
                this.selectedIcon = this.pinnable.icon;
                this.titleIcon = this.pinnable.icon;
                break;
            }
          this.titleColor = '#1F195E';
          this.folderName = 'New Folder';
          this.folderRoomsLoaded = true;
          break;
        case 'editRoom':
            colors = this.pinnable.color_profile.gradient_color;
            this.roomName = this.pinnable.title;
            this.timeLimit = this.pinnable.location.max_allowed_time;
            this.roomNumber = this.pinnable.location.room;
            this.selectedTeachers = this.pinnable.location.teachers;
            this.nowRestriction = this.pinnable.location.restricted;
            this.futureRestriction = this.pinnable.location.scheduling_restricted;
            this.color_profile = this.pinnable.color_profile;
            this.selectedIcon = this.pinnable.icon;
            this.travelType = this.pinnable.location.travel_types;
            this.titleIcon = this.pinnable.icon;
            this.generateAdvOptionsModel(this.pinnable.location);
            break;
        case 'edit':
          // colors = '#606981, #ACB4C1';
          this.titleColor = '#1F195E';
          this.folderName = 'Bulk Edit Rooms';
          this.form.get('timeLimit').clearValidators();
          this.form.get('timeLimit').setValidators([
              Validators.pattern('^[0-9]*?[0-9]+$'),
              Validators.min(1),
              Validators.max(59)]);
          console.log('BULK SELECTED ROOMS =====>>> \n', this.selectedRooms);
          this.bulkWarningText = !!_.find<Location | Pinnable>(this.selectedRooms, {type: 'category'});
          break;
    }
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  get isValidForm() {
      return this.form.get('roomName').valid &&
             this.form.get('roomNumber').valid &&
             this.form.get('timeLimit').valid;
  }

  get showPublishNewRoom() {
      return this.form.get('roomName').valid &&
             this.form.get('roomNumber').valid &&
             this.form.get('timeLimit').valid &&
             this.isDirtyNowRestriction &&
             this.isDirtyFutureRestriction &&
             !!this.color_profile && !!this.selectedIcon &&
             (this.isDirtyAdvancedOpt ? this.advOptValid : true);
  }

  get showPublishEditRoom() {
     return this.isValidForm && this.isFormStateDirty || (this.isDirtyAdvancedOpt && this.advOptValid);
  }

  get showPublishNewFolder() {
    return this.form.get('folderName').valid &&
        !!this.color_profile &&
        !!this.selectedIcon &&
        this.isChangeState &&
        (!!this.selectedRooms.length);
  }

  get showPublishEditFolder() {
      return this.showPublishNewFolder && (this.isFormStateDirty || this.isChangeLocations.value) && this.isEditFolder;
  }

  get showDoneButton() {
    return (this.isValidForm &&
        (this.editRoomInFolder ? this.isFormStateDirty : true) &&
        this.overlayType === 'newRoomInFolder' &&
        (!this.editRoomInFolder ? (this.isDirtyNowRestriction && this.isDirtyFutureRestriction) : true)) ||
        (this.form.get('timeLimit').valid && this.overlayType === 'settingsRooms' && this.settingsTouched);
  }

  get settingsTouched() {

    if (this.importedRooms.length) {
      return this.isDirtyNowRestriction &&
        this.isDirtyFutureRestriction &&
        this.isDirtyTravel &&
        !!this.timeLimit;
    } else {

     return this.isDirtyNowRestriction ||
      this.isDirtyFutureRestriction ||
      this.isDirtyTravel ||
      !!this.timeLimit;
    }

  }

  get sortSelectedRooms() {

    return _.sortBy(this.selectedRooms, (res) => res.title.toLowerCase());
  }


  get showFolderName() {
    return this.overlayType === 'newFolder'
       || this.overlayType === 'newRoomInFolder'
       || this.overlayType === 'addExisting'
       || this.overlayType === 'importRooms'
       || this.overlayType === 'settingsRooms'
       || this.overlayType === 'edit';
    }

  get hideHeaderIcon() {
    return this.overlayType === 'newRoomInFolder' ||
        this.overlayType === 'importRooms' ||
        this.overlayType === 'settingsRooms' ||
        this.overlayType === 'addExisting';
  }

  get backButtonState() {
    if (this.overlayType === 'newRoom' ||
        (this.overlayType === 'newFolder' && !this.isEditFolder)
        || this.overlayType === 'edit'
    ) {
        return !this.isChangeState;
    }
    if (this.overlayType === 'editRoom' || this.isEditFolder) {
      return this.isChangeLocations.value ? !this.isChangeLocations.value : !this.isFormStateDirty;
    }
  }

  get backButtonsStateInFolder() {
    if (this.overlayType === 'newRoomInFolder' && !this.editRoomInFolder) {
       return this.isChangeStateInFolder ||
           this.isDirtyNowRestriction ||
           this.isDirtyFutureRestriction ||
           this.isDirtyTravel;
    }
    if (this.overlayType === 'newRoomInFolder' && this.editRoomInFolder) {
       return this.isFormStateDirty;
    }
    if (this.overlayType === 'settingsRooms') {
        return this.isChangeStateInFolder ||
            this.isDirtyNowRestriction ||
            this.isDirtyFutureRestriction ||
            this.isDirtyTravel ||
            this.importedRooms.length || this.uploadingProgress.completed;
    }
    if (this.overlayType === 'importRooms') {
      return this.uploadingProgress.completed;
    }
  }

  get inactiveTogglePickerSettings() {
      return this.overlayType === 'newRoom' ||
          (this.overlayType === 'newRoomInFolder' && !this.editRoomInFolder) ||
          this.overlayType === 'settingsRooms' ||
          this.overlayType === 'edit';
  }


  get headerText() {
    if (this.overlayType === 'newRoomInFolder') {
      return this.roomName;
    } else if (this.overlayType === 'settingsRooms' && this.isEditRooms) {
        return 'Editing ' + this.readyRoomsToEdit.length + ' Rooms';
    } else if ((this.overlayType === 'importRooms' && this.importedRooms.length && this.uploadingProgress.completed) ||
                (this.overlayType === 'settingsRooms' && this.isEditRooms)) {
      return 'Adding ' + this.importedRooms.length + ' Rooms';
    } else {
      return 'Import Rooms';
    }
  }

  ngOnInit() {

      this.buildForm();

      this.overlayType = this.dialogData['type'];
      if (this.dialogData['pinnable']) {
          this.pinnable = this.dialogData['pinnable'];

          if (this.pinnable.type === 'category') {
              this.locationService.getLocationsWithCategory(this.pinnable.category)
                  .subscribe((res: Location[]) => {
                      this.folderRoomsLoaded = true;
                      this.selectedRooms = res;
                      if (this.dialogData['forceSelectedLocation']) {
                          this.setToEditRoom(this.dialogData['forceSelectedLocation']);
                      }
                  });
          }
      }
      if (this.dialogData['rooms']) {
          if (this.overlayType === 'newFolder') {
              this.dialogData['rooms'].forEach((room: Pinnable) => {
                  if (room.type === 'category') {
                      this.locationService.getLocationsWithCategory(room.category)
                          .subscribe((res: Location[]) => {
                              this.selectedRooms = [...this.selectedRooms, ...res];
                          });
                  } else {
                      this.selectedRooms.push(room.location);
                  }
              });
          } else {
              this.selectedRooms = this.dialogData['rooms'];
          }
      }

      if (this.dialogData['pinnables$']) {
          this.pinnables$ = this.dialogData['pinnables$'];

          this.pinnables$ = this.pinnables$.pipe(map(pinnables => {
              const filterLocations = _.filter<Pinnable>(pinnables, {type: 'location'});
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
                  return item.location.id === _.pullAll(locationsIds, currentLocationsIds).find(id => item.location.id === id);
              });
          }));

      }
      if (this.dialogData['isEditFolder']) {
          this.isEditFolder = true;
      }

      this.getHeaderData();

      this.buildInitialState();

      this.form.valueChanges.subscribe(res => {
          if (!!res.file || !!res.roomName || !!res.folderName || !!res.roomNumber || !!res.timeLimit) {
              this.changeState();
          } else {
              this.isChangeState = false;
          }
          if (!!res.roomName || res.roomNumber || res.timeLimit) {
              this.isChangeStateInFolder = true;
          } else {
              this.isChangeStateInFolder = false;
          }
      });

     this.icons$ = merge(this.form.get('roomName').valueChanges, this.form.get('folderName').valueChanges)
          .pipe(filter(value => value !== ''),
              switchMap((value: string) => this.http.searchIcons(value.toLowerCase())));
  }

  buildForm() {
    this.form = new FormGroup({
        // isEdit: new FormControl(true),
        file: new FormControl(),
        roomName: new FormControl('',
            [Validators.required, Validators.maxLength(15)],
            this.uniqueRoomNameValidator.bind(this)),
        folderName: new FormControl('',
            [Validators.required, Validators.maxLength(17)],
            this.uniqueFolderNameValidator.bind(this)),
        roomNumber: new FormControl('',
            [Validators.required, Validators.maxLength(5)]),
        timeLimit: new FormControl(null, [
            Validators.required,
            Validators.pattern('^[0-9]*?[0-9]+$'),
            Validators.min(1),
            Validators.max(59)
            ]
        )
    });
  }

  generateAdvOptionsModel(loc: Location) {
      if (loc.request_mode === 'teacher_in_room' || loc.request_mode === 'all_teachers_in_room') {

          const mode = loc.request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

          if (loc.request_send_destination_teachers && loc.request_send_origin_teachers) {
              this.advOptState.now.data[mode] = 'both';
          } else if (loc.request_send_destination_teachers) {
              this.advOptState.now.data[mode] = 'destination';
          } else if (loc.request_send_origin_teachers) {
              this.advOptState.now.data[mode] = 'origin';
          }
      } else if (loc.request_mode === 'specific_teachers') {
          this.advOptState.now.data.selectedTeachers = loc.request_teachers;
      }
      if (loc.scheduling_request_mode === 'teacher_in_room' || loc.scheduling_request_mode === 'all_teachers_in_room') {

          const mode = loc.scheduling_request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

          if (loc.scheduling_request_send_destination_teachers && loc.scheduling_request_send_origin_teachers) {
              this.advOptState.future.data[mode] = 'both';
          } else if (loc.scheduling_request_send_destination_teachers) {
              this.advOptState.future.data[mode] = 'destination';
          } else if (loc.scheduling_request_send_origin_teachers) {
              this.advOptState.future.data[mode] = 'origin';
          }
      } else if (loc.scheduling_request_mode === 'specific_teachers') {
          this.advOptState.future.data.selectedTeachers = loc.scheduling_request_teachers;
      }

      if (loc.request_mode === 'any_teacher') {
          this.advOptState.now.state = 'Any teacher (default)';
      } else if (loc.request_mode === 'teacher_in_room') {
          this.advOptState.now.state = 'Any teachers assigned';
      } else if (loc.request_mode === 'all_teachers_in_room') {
          this.advOptState.now.state = 'All teachers assigned';
      } else if (loc.request_mode === 'specific_teachers') {
          this.advOptState.now.state = 'Certain \n teacher(s)';
      }
      if (loc.scheduling_request_mode === 'any_teacher') {
          this.advOptState.future.state = 'Any teacher (default)';
      } else if (loc.scheduling_request_mode === 'teacher_in_room') {
          this.advOptState.future.state = 'Any teachers assigned';
      } else if (loc.scheduling_request_mode === 'all_teachers_in_room') {
          this.advOptState.future.state = 'All teachers assigned';
      } else if (loc.scheduling_request_mode === 'specific_teachers') {
          this.advOptState.future.state = 'Certain \n teacher(s)';
      }
      return this.advOptState;
  }

  uniqueRoomNameValidator(control: AbstractControl) {
      return this.locationService.checkLocationName(control.value)
          .pipe(map((res: any) => {
              if (this.overlayType === 'newRoom' || (this.overlayType === 'newRoomInFolder' && !this.editRoomInFolder)) {
                  return res.title_used ? { room_name: true } : null;
              }
              return res.title_used &&
              (this.editRoomInFolder ?
                  this.currentLocationInEditRoomFolder.title : this.pinnable.location.title) !== this.roomName ? { room_name: true } : null;
          }));
  }

  uniqueRoomNumberValidator(control: AbstractControl) {
      return this.locationService.checkLocationNumber(control.value)
          .pipe(map((res: any) => {
              if (this.overlayType === 'newRoom' || (this.overlayType === 'newRoomInFolder' && !this.editRoomInFolder)) {
                  return res.title_used ? { room_number: true } : null;
              }
              return res.title_used &&
              (this.editRoomInFolder ?
                  this.currentLocationInEditRoomFolder.room : this.pinnable.location.room) !== this.roomNumber ? { room_number: true } : null;
          }));
  }

  uniqueFolderNameValidator(control: AbstractControl) {
      return this.hallPassService.checkPinnableName(control.value)
          .pipe(map((res: any) => {
              if (this.overlayType === 'newFolder' && !this.isEditFolder) {
                  return res.title_used ? { folder_name: true } : null;
              }
              return res.title_used && this.pinnable.title !== this.folderName ? { folder_name: true } : null;
          }));
  }

  buildInitialState() {
      if (this.overlayType === 'editRoom' || this.isEditFolder) {
          this.initialState = {
              roomName: this.roomName,
              folderName: this.folderName,
              roomNumber: this.roomNumber,
              restricted: this.nowRestriction,
              scheduling_restricted: this.futureRestriction,
              travel_type: this.travelType,
              teachers: this.selectedTeachers.map(t => +t.id),
              color: this.color_profile.id,
              icon: this.selectedIcon,
              timeLimit: +this.timeLimit,
              advOptState: this.advOptState
          };
      }
      if (this.overlayType === 'newFolder') {
        this.roomList.ready.asObservable().subscribe((el: ElementRef) => {
          el.nativeElement.scrollTop = this.roomList.topScroll;
        });
      }
  }

  changeState() {
    this.isChangeState = true;
    if (this.overlayType === 'editRoom' || (this.isEditFolder && this.overlayType !== 'newRoomInFolder') || this.editRoomInFolder) {
        const initState = this.initialState;
        const currState: FormState = {
            roomName: this.roomName,
            folderName: this.folderName,
            roomNumber: this.roomNumber,
            restricted: this.nowRestriction,
            scheduling_restricted: this.futureRestriction,
            travel_type: this.travelType,
            teachers: this.selectedTeachers.map(t => +t.id),
            color: this.overlayType === 'editRoom' || this.isEditFolder ? this.color_profile.id : null,
            icon: this.overlayType === 'editRoom' || this.isEditFolder ? this.selectedIcon.inactive_icon : null,
            timeLimit: +this.timeLimit,
            advOptState: this.advOptState
        };
        const status = [];
        status.push(currState.roomName === initState.roomName);
        status.push(currState.roomNumber === initState.roomNumber);
        status.push(currState.restricted === initState.restricted);
        status.push(currState.scheduling_restricted === initState.scheduling_restricted);
        status.push(_.isEqual(currState.teachers, initState.teachers));
        if (currState.folderName && initState.folderName) {
            status.push(currState.folderName === initState.folderName);
        }
        if (currState.color && initState.color) {
            status.push(currState.color === initState.color);
        }
        if (currState.timeLimit && initState.timeLimit) {
            status.push(currState.timeLimit === initState.timeLimit);
        }
        if (currState.travel_type && initState.travel_type) {
            status.push(_.isEqual(currState.travel_type.sort(), initState.travel_type.sort()));
        }
        if (currState.icon && initState.icon) {
            status.push(currState.icon === initState.icon);
        }
        if (currState.advOptState && initState.advOptState) {
            status.push(currState.advOptState.now.state === initState.advOptState.now.state);
            status.push(currState.advOptState.future.state === initState.advOptState.future.state);
            status.push(currState.advOptState.now.data.any_teach_assign === initState.advOptState.now.data.any_teach_assign);
            status.push(currState.advOptState.now.data.all_teach_assign === initState.advOptState.now.data.all_teach_assign);
            status.push(_.isEqual(currState.advOptState.now.data.selectedTeachers, initState.advOptState.now.data.selectedTeachers));
            status.push(currState.advOptState.future.data.any_teach_assign === initState.advOptState.future.data.any_teach_assign);
            status.push(currState.advOptState.future.data.all_teach_assign === initState.advOptState.future.data.all_teach_assign);
            status.push(_.isEqual(currState.advOptState.future.data.selectedTeachers, initState.advOptState.future.data.selectedTeachers));
        }
        this.isFormStateDirty = status.includes(false);
    }
  }

  setLocation(location) {
    let type;
    let hideAppearance;
    switch (location) {
        case 'newRoomInFolder':
          this.roomName = 'New Room';
          hideAppearance = true;
          type = 'newRoomInFolder';
          break;
        case 'newFolder':
          this.editRoomInFolder = false;
          this.showDoneSpinner = false;
          this.selectedRoomsInFolder = [];
          this.selectedTeachers = [];
          this.travelType = [];
          this.nowRestriction = false;
          this.futureRestriction = false;
          this.roomName = '';
          this.roomNumber = '';
          this.timeLimit = '';
          this.readyRoomsToEdit = [];
          this.importedRooms = [];
          this.isEditRooms = false;
          this.form.get('timeLimit').setValidators([Validators.required,
              Validators.pattern('^[0-9]*?[0-9]+$'),
              Validators.min(1),
              Validators.max(59)]);
          this.form.reset();
          this.isDirtysettings = false;
          this.buildInitialState();
          this.isFormStateDirty = false;
          hideAppearance = false;
          type = 'newFolder';
          break;
        case 'importRooms':
          hideAppearance = true;
          type = 'importRooms';
          break;
        case 'addExisting':
          hideAppearance = true;
          type = 'addExisting';
          break;
        case 'settingsRooms':
          hideAppearance = true;
          type = 'settingsRooms';
          break;
        case 'editRoomInFolder':
          this.editRoomInFolder = true;
          hideAppearance = true;
          type = 'newRoomInFolder';
    }
    this.hideAppearance = hideAppearance;
    this.overlayType = type;
    return false;
  }

  changeColor(color) {
    this.color_profile = color;
    this.titleColor = 'white';
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + color.gradient_color + ')';
    this.isDirtyColor = true;
    this.changeState();
  }

  changeIcon(icon) {
    this.selectedIcon = icon;
    this.titleIcon = icon.inactive_icon;
    this.isDirtyIcon = true;
    this.changeState();
  }

  addToFolder(rooms: any[]) {
      this.isChangeLocations.next(true);
      this.pinnableToDeleteIds = rooms.map(pin => +pin.id);
      const locationsToAdd = rooms.map(room => room.location);
      this.selectedRooms = [...locationsToAdd, ...this.selectedRooms];
      this.setLocation('newFolder');
  }

  advancedOptions(event: OptionState) {
      this.advOptState = event;
  }

  normilizeAdvOptData() {
      const data: any = {};
      if (this.advOptState.now.state === 'Any teacher (default)') {
          data.request_mode = 'any_teacher';
      } else if (this.advOptState.now.state === 'Any teachers assigned') {
          data.request_mode = 'teacher_in_room';
      } else if (this.advOptState.now.state === 'All teachers assigned') {
          data.request_mode = 'all_teachers_in_room';
      } else if (this.advOptState.now.state === 'Certain \n teacher(s)') {
          data.request_mode = 'specific_teachers';
      }
      if (this.advOptState.now.data.any_teach_assign === 'both' || this.advOptState.now.data.all_teach_assign === 'both') {
          data.request_send_origin_teachers = true;
          data.request_send_destination_teachers = true;
      } else if (this.advOptState.now.data.any_teach_assign === 'origin' || this.advOptState.now.data.all_teach_assign === 'origin') {
          data.request_send_origin_teachers = true;
          data.request_send_destination_teachers = false;
      } else if (this.advOptState.now.data.any_teach_assign === 'destination' || this.advOptState.now.data.all_teach_assign === 'destination') {
          data.request_send_destination_teachers = true;
          data.request_send_origin_teachers = false;
      } else if (this.advOptState.now.data.selectedTeachers.length) {
          data.request_teachers = this.advOptState.now.data.selectedTeachers;
      }
      if (this.advOptState.future.data.any_teach_assign === 'both' || this.advOptState.future.data.all_teach_assign === 'both') {
          data.scheduling_request_send_origin_teachers = true;
          data.scheduling_request_send_destination_teachers = true;
      } else if (this.advOptState.future.data.all_teach_assign === 'origin' || this.advOptState.future.data.any_teach_assign === 'origin') {
          data.scheduling_request_send_origin_teachers = true;
          data.scheduling_request_send_destination_teachers = false;
      } else if (this.advOptState.future.data.all_teach_assign === 'destination' || this.advOptState.future.data.any_teach_assign === 'destination') {
          data.scheduling_request_send_destination_teachers = true;
          data.scheduling_request_send_origin_teachers = false;
      } else if (this.advOptState.future.data.selectedTeachers.length) {
          data.scheduling_request_teachers = this.advOptState.future.data.selectedTeachers;
      }
      return data;
  }

  back() {
    this.dialogRef.close();
  }

  setToEditRoom(room) {
      this.roomToEdit = room;
      this.roomName = room.title;
      this.timeLimit = room.max_allowed_time;
      this.roomNumber = room.room;
      this.selectedTeachers = room.teachers;
      this.nowRestriction = room.restricted;
      this.futureRestriction = room.scheduling_restricted;
      this.travelType = room.travel_types;

      this.currentLocationInEditRoomFolder = room;

      this.initialState = {
          roomName: room.title,
          roomNumber: room.room,
          teachers: room.teachers.map(t => +t.id),
          restricted: room.restricted,
          scheduling_restricted: room.scheduling_restricted,
          travel_type: room.travel_types,
          timeLimit: room.max_allowed_time
      };

      this.setLocation('editRoomInFolder');
      if (!this.dialogData['forceSelectedLocation']) {
        this.roomList.topScroll = this.roomList.domElement.nativeElement.scrollTop;
      }
  }

  onPublish() {
    this.showPublishSpinner = true;
    if (this.overlayType === 'newRoom') {
       const location = {
                title: this.roomName,
                room: this.roomNumber,
                restricted: this.nowRestriction,
                scheduling_restricted: this.futureRestriction,
                teachers: this.selectedTeachers.map(teacher => teacher.id),
                travel_types: this.travelType,
                max_allowed_time: +this.timeLimit
        };
       this.locationService.createLocation(location)
           .pipe(switchMap((loc: Location) => {
               const pinnable = {
                   title: this.roomName,
                   color_profile: this.color_profile.id,
                   icon: this.selectedIcon.inactive_icon,
                   location: loc.id,
               };
               return this.hallPassService.createPinnable(pinnable);
           })).subscribe(response => this.dialogRef.close());
    }

    if (this.overlayType === 'newFolder' || this.overlayType === 'newRoomInFolder') {
        if (this.selectedRooms.length < 1) {
            const newFolder = {
                title: this.folderName,
                color_profile: this.color_profile.id,
                icon: this.selectedIcon.inactive_icon,
                category: this.folderName
            };
            this.hallPassService.updatePinnable(this.pinnable.id, newFolder)
            .subscribe(res => this.dialogRef.close());
        }
        const locationsToUpdate$ = this.selectedRooms.map(location => {
            let id;
            let data;
            if (location.location) {
                id = location.location.id;
                data = location.location;
                data.category = this.folderName;
                data.teachers = data.teachers.map(t => t.id);
            }
            if (!location.location) {
                id = location.id;
                data = location;
                data.category = this.folderName;
                if (data.teachers) {
                    data.teachers = data.teachers.map(teacher => teacher.id);
                }
            }
            return this.locationService.updateLocation(id, data);
        });
        forkJoin(locationsToUpdate$).pipe(switchMap(locations => {
            const newFolder = {
                title: this.folderName,
                color_profile: this.color_profile.id,
                icon: this.selectedIcon.inactive_icon,
                category: this.folderName
            };
        return this.isEditFolder
                ?
               this.hallPassService.updatePinnable(this.pinnable.id, newFolder)
                :
          zip(
            this.hallPassService.getArrangedPinnables(),
            this.hallPassService.createPinnable(newFolder)
          ).pipe(
             switchMap((result: any[]) => {
               const arrengedSequence = result[0].map(item => item.id);
                     arrengedSequence.push(result[1].id);
               return this.hallPassService.createArrangedPinnable( { order: arrengedSequence.join(',')});
             })
          );
        })).subscribe(() => !this.pinnableToDeleteIds.length ? this.dialogRef.close() : false);
        if (this.pinnableToDeleteIds.length) {
          const deleteRequests = this.pinnableToDeleteIds.map(id => this.hallPassService.deletePinnable(id));
          zip(...deleteRequests).subscribe(() => this.dialogRef.close());
        }
    }
    if (this.overlayType === 'editRoom') {
        const location = {
            title: this.roomName,
            room: this.roomNumber,
            restricted: this.nowRestriction,
            scheduling_restricted: this.futureRestriction,
            teachers: this.selectedTeachers.map(teacher => teacher.id),
            travel_types: this.travelType,
            max_allowed_time: +this.timeLimit
        };

        const mergedData = {...location, ...this.normilizeAdvOptData()};

        this.locationService.updateLocation(this.pinnable.location.id, location)
            .pipe(switchMap((loc: Location) => {
                const pinnable = {
                    title: this.roomName,
                    color_profile: this.color_profile.id,
                    icon: this.selectedIcon.inactive_icon,
                    location: loc.id,
                };
                return this.hallPassService.updatePinnable(this.pinnable.id, pinnable);
            })).subscribe(response => this.dialogRef.close());
    }
  }

  done() {
      this.showDoneSpinner = true;
      if (this.overlayType === 'newRoomInFolder') {
          const location = {
                  title: this.roomName,
                  room: this.roomNumber,
                  restricted: this.nowRestriction,
                  scheduling_restricted: this.futureRestriction,
                  teachers: this.selectedTeachers.map(teacher => teacher.id),
                  travel_types: this.travelType,
                  max_allowed_time: +this.timeLimit
            };
          if (this.editRoomInFolder) {
              this.locationService.updateLocation(this.roomToEdit.id, location)
              .subscribe((res: Location) => {
                  const newCollection = this.selectedRooms.filter(room => room.id !== this.roomToEdit.id);
                  this.selectedRooms = [res, ...newCollection];
                  this.setLocation('newFolder');
                  this.isChangeLocations.next(true);
              });
          } else {
              this.locationService.createLocation(location)
              .subscribe(loc => {
                  this.newRoomsInFolder.push(loc);
                  this.selectedRooms.push(loc);
                  this.setLocation('newFolder');
                  this.isChangeLocations.next(true);
              });
          }
      }
      if (this.overlayType === 'settingsRooms') {
          if (this.importedRooms.length) {
              this.importedRooms = this.importedRooms.map((_room, index) => {
                  _room.restricted = this.nowRestriction;
                  _room.scheduling_restricted = this.futureRestriction;
                  _room.max_allowed_time = +this.timeLimit;
                  _room.travel_types = this.travelType;
                  // setTimeout(() => {}, 100);
                  return this.locationService.createLocation(_room);
              });
              zip(...this.importedRooms).subscribe((result) => {
                  this.selectedRooms = [...result, ...this.selectedRooms];
                  this.setLocation('newFolder');
                  this.isChangeLocations.next(true);
              });

          } else if (this.readyRoomsToEdit.length) {
              const locationsToEdit = this.readyRoomsToEdit.map(room => {
                  if (room.location) {
                      const data: any = {
                          restricted: this.nowRestriction,
                          scheduling_restricted: this.futureRestriction,
                          travel_types: this.travelType
                      };
                      if (this.timeLimit) {
                          data.max_allowed_time =  +this.timeLimit;
                      }
                      return this.locationService.updateLocation(room.location.id, data);
                  } else {
                      const data: any = {
                          restricted: this.nowRestriction,
                          scheduling_restricted: this.futureRestriction,
                          travel_types: this.travelType
                      };
                      if (this.timeLimit) {
                          data.max_allowed_time =  +this.timeLimit;
                      }
                      return this.locationService.updateLocation(room.id, data);
                  }
              });
              forkJoin(locationsToEdit).subscribe(res => {
                  const locIds = res.map((loc: Location) => loc.id);
                  const newCollection = this.selectedRooms.filter(room => room.id !== locIds.find(id => id === room.id));
                  this.selectedRooms = [...res, ...newCollection];
                  this.setLocation('newFolder');
                  this.isChangeLocations.next(true);
              });
          }
       }

       if (this.overlayType === 'edit') {
         this.showPublishSpinner = true;
         const selectedLocations = _.filter<Location | Pinnable>(this.selectedRooms, {type: 'location'}).map((res: any) => res.location);
          const locationsFromFolder = _.filter<Location | Pinnable>(this.selectedRooms, {type: 'category'}).map((folder: any) => {
              return this.locationService.getLocationsWithCategory(folder.category);
          });
          if (locationsFromFolder.length) {
              forkJoin(locationsFromFolder).pipe(switchMap((res) => {
                  const mergeLocations = _.concat(selectedLocations, ...res);
                  const locationsToEdit = mergeLocations.map((room: any) => {
                      const data: any = {
                          restricted: this.nowRestriction,
                          scheduling_restricted: this.futureRestriction,
                          travel_types: this.travelType
                      };
                      if (this.timeLimit) {
                          data.max_allowed_time =  +this.timeLimit;
                      }
                      return this.locationService.updateLocation(room.id, data);
                  });
                  return forkJoin(locationsToEdit);
              })).subscribe(() => this.dialogRef.close());
          } else {
              const locationsToEdit = selectedLocations.map((room: any) => {
                  const data: any = {
                      restricted: this.nowRestriction,
                      scheduling_restricted: this.futureRestriction,
                      travel_types: this.travelType
                  };
                  if (this.timeLimit) {
                      data.max_allowed_time =  +this.timeLimit;
                  }
                  return this.locationService.updateLocation(room.id, data);
              });
              forkJoin(locationsToEdit).subscribe(() => this.dialogRef.close());
          }
       }
  }

  requireValidator(value) {
    if (!value || value === '' || value === 'New Room' || value === 'New Folder') {
      return true;
    }
    return false;
  }

  selectedRoomsEvent(event, room, all?: boolean) {

    if (all) {
      if (event.checked) {
        this.readyRoomsToEdit = this.selectedRooms;
      } else {
        this.readyRoomsToEdit = [];
      }
    } else if (event.checked) {
        this.readyRoomsToEdit.push(room);
    } else {
      this.readyRoomsToEdit = this.readyRoomsToEdit.filter(readyRoom => readyRoom.id !== room.id);
    }

  }

  isSelected(room) {
    return this.readyRoomsToEdit.find((item) => {
      return room.id === item.id;
    });
  }

  onEditRooms(action) {
    if (action === 'edit') {
        this.isEditRooms = true;
        this.form.get('timeLimit').clearValidators();
        this.form.get('timeLimit').setValidators([
            Validators.pattern('^[0-9]*?[0-9]+$'),
            Validators.min(1),
            Validators.max(59)]);
        this.setLocation('settingsRooms');
    }
    if (action === 'remove_from_folder') {
        const currentRoomsIds = this.readyRoomsToEdit.map(item => item.id);
        const allSelectedRoomsIds = this.selectedRooms.map(item => item.id);
        this.selectedRooms = this.selectedRooms.filter(item => {
            return item.id === _.pullAll(allSelectedRoomsIds, currentRoomsIds).find(id => item.id === id);
        });
        this.readyRoomsToEdit = [];
     }
    if (action === 'delete') {
        const roomsToDelete = this.readyRoomsToEdit.map(room => {
            return this.locationService.deleteLocation(room.id);
        });
        forkJoin(roomsToDelete).subscribe(res => {
            const currentRoomsIds = this.readyRoomsToEdit.map(item => item.id);
            const allSelectedRoomsIds = this.selectedRooms.map(item => item.id);
            this.selectedRooms = this.selectedRooms.filter(item => {
                return item.id === _.pullAll(allSelectedRoomsIds, currentRoomsIds).find(id => item.id === id);
            });
            this.readyRoomsToEdit = [];
            this.isChangeLocations.next(true);
        });
    }
  }

  deleteRoom() {
    if (this.overlayType === 'editRoom' || (this.isEditFolder && this.overlayType === 'newFolder')) {

      const deletions = [
        this.hallPassService.deletePinnable(this.pinnable.id)
      ];

      if (this.pinnable.location) {
        deletions.push(this.locationService.deleteLocation(this.pinnable.location.id));
      }

      zip(...deletions).subscribe(res => {
        console.log(res);
        this.dialogRef.close();
      });
    }

    if (this.editRoomInFolder) {
        this.locationService.deleteLocation(this.currentLocationInEditRoomFolder.id)
        .subscribe((res: Location) => {
            this.selectedRooms = this.selectedRooms.filter(room => room.id !== this.currentLocationInEditRoomFolder.id);
            this.setLocation('newFolder');
            this.isChangeLocations.next(true);
        });
    }

  }

  travelUpdate(type) {
   let travelType: string[];
   if (type === 'Round-trip') {
     travelType = ['round_trip'];
   } else if (type === 'One-way') {
     travelType = ['one_way'];
   } else if (type === 'Both') {
     travelType = ['one_way', 'round_trip'];
   }
   this.travelType = travelType;
   if (!!travelType) {
     this.isChangeState = false;
     this.changeState();
   }
  }

  nowRestrictionUpdate(restriction) {
    this.nowRestriction = restriction === 'Restricted';
    if (!!restriction) {
      this.changeState();
    }
  }

  futureRestrictionUpdate(restriction) {
    this.futureRestriction = restriction === 'Restricted';
    if (!!restriction) {
      this.changeState();
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
  selectTeacherEvent(teachers) {
    console.log(teachers);
    this.selectedTeachers = teachers;
    this.isDirtysettings = true;
    this.showProfileSearch = false;
    this.changeState();
  }

  isEmitTeachers(event) {
     this.showSearchTeacherOptions = event;
  }

  onUpdate(time) {
      this.timeLimit = time;
  }

  openInfo({event, action}) {
    this.isActiveIcon[action] = true;
  }

  closeInfo(action) {
    this.isActiveIcon[action] = false;
  }

  handleDragEvent( evt: DragEvent, dropAreaColor: string) {
    evt.preventDefault();
    if (this.dropArea && this.dropArea.nativeElement && this.getRoomImportScreen() === 1) {

      this.dropArea.nativeElement.style.borderColor = dropAreaColor;
    }
  }

  getRoomImportScreen() {
    if (!this.importedRooms.length || !this.uploadingProgress.completed) {
      return 1;
    } else if (this.importedRooms.length && this.unknownEmails.length && this.uploadingProgress.completed) {
      return 2;
    } else if (this.importedRooms.length && !this.unknownEmails.length) {
      // return 3;
      this.setLocation('settingsRooms');

    }

  }

  getProgress(progress: HTMLElement) {
    const timerId = setInterval(() => {
      if (this.uploadingProgress.percent < 100) {
        progress.style.backgroundImage = `linear-gradient(to right, #ECF1FF ${this.uploadingProgress.percent}%, transparent 0)`;
        this.uploadingProgress.percent += 1;
      } else {
        progress.style.backgroundImage = `linear-gradient(to right, #ECF1FF 100%, transparent 0)`;
        clearInterval(timerId);
      }
    }, 500);
  }
  resetRoomImport() {
    // if (this.overlayType === 'importRooms') {

      this.importedRooms = [];
      this.unknownEmails = [];
      this.uploadingProgress.inProgress = false;
      this.uploadingProgress.completed = false;
      this.uploadingProgress.percent = 0;
    // }
  }

  catchFile(evt: DragEvent) {
    evt.preventDefault();
    this.uploadingProgress.inProgress = true;

    of(evt)
      .pipe(
        switchMap((dragEvt: DragEvent) => {
          const FR = new FileReader();
          FR.readAsBinaryString(dragEvt.dataTransfer.files[0]);
          return fromEvent(FR, 'load');
        }),
        map(( res: any) => {
          const raw = XLSX.read(res.target.result, {type: 'binary'});
          const sn = raw.SheetNames[0];
          const stringCollection = raw.Sheets[sn];
          const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
          let rows = data.slice(1);
          rows = rows.map((row, index) => {
            const _room: any = {};
            _room.title = row[0];
            _room.room = row[1];
            _room.teachers = <string>row[2] ? row[2].split(', ') : [];
            return _room;
          });
          return rows;
        }),
        map((rows) => {
          rows = rows.map((r: any) => {
            if (r.title && r.title.length > 16) {
              r.title = r.title.slice(0, 15);
            }
            if (r.room && (r.room + '').length > 8) {
              r.title = r.title.slice(0, 7);
            }
            return r;
          });
          const groupedRooms = _.groupBy(rows, (r: any) => r.title);
          let normalizedRooms = [];
          console.log(groupedRooms);

          for (const key in groupedRooms) {
            if (groupedRooms[key].length > 1) {
              normalizedRooms = normalizedRooms.concat(
                groupedRooms[key].map((duplicate: any, index: number) => {
                  duplicate.title = duplicate.title + ++index;
                  return duplicate;
                })
              );
            } else {
              normalizedRooms = normalizedRooms.concat(groupedRooms[key]);
            }
          }
          console.log(normalizedRooms);
          return normalizedRooms;
        }),
        switchMap((_rooms: any[]): Observable<any[]> => {
            console.log(_rooms)
          return this.userService.getUsersList('_profile_teacher')
            .pipe(
              map((teachers: any[]) => {

                return _rooms.map((_room) => {
                          const teachersIdArray = [];
                          const unknownArray = [];

                          _room.teachers.forEach((_teacherEmail) => {
                            const existAndAttached = teachers.find(_teacher =>  _teacher.primary_email === _teacherEmail );
                            if (existAndAttached) {
                              teachersIdArray.push(existAndAttached.id);
                            } else {
                              this.unknownEmails.push({
                                room: _room,
                                email: _teacherEmail
                              });
                            }
                          });

                          _room.teachers = teachersIdArray;
                          return _room;
                      });
              }));
        }),
      )
      .subscribe((rooms) => {
        console.log(rooms);
        console.log(this.unknownEmails);
          setTimeout(() => {
            this.uploadingProgress.inProgress = false;
            this.uploadingProgress.completed = true;
          }, 1500);
        this.importedRooms = rooms;
      });


  }
}
