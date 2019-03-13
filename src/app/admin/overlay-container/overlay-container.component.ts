import {Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {BehaviorSubject, forkJoin, fromEvent, Observable, of, Subject, zip} from 'rxjs';
import { map, switchMap} from 'rxjs/operators';

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

  @ViewChild('file') selectedFile;
  selectedRooms = [];
  selectedRoomsInFolder: Pinnable[] = [];
  selectedTeachers: User[] = [];
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

  initialState: FormState;
  isFormStateDirty: boolean;

  bulkWarningText: boolean;
  isDirtysettings: boolean;
  isDirtyTravel: boolean;
  isDirtyNowRestriction: boolean;
  isDirtyFutureRestriction: boolean;
  isDirtyColor: boolean;
  isDirtyIcon: boolean;

  isChangeState: boolean;
  isChangeStateInFolder: boolean;

  isChangeLocations = new BehaviorSubject<boolean>(false);

  showSearchTeacherOptions: boolean;

  newRoomsInFolder = [];
  pinnableToDeleteIds: number[] = [];

  titleColor: string = 'white';

  form: FormGroup;

  showPublishSpinner: boolean;
  showDoneSpinner: boolean;

  hideDeleteButton: boolean;

  buttonsInFolder = [
      { title: 'New Room', icon: './assets/Create (White).png', location: 'newRoomInFolder'},
      { title: 'Import Rooms', icon: null, location: 'importRooms'},
      { title: 'Add Existing', icon: null, location: 'addExisting'}
  ];
  buttonsWithSelectedRooms = [
      { title: 'Bulk Edit Rooms', action: 'edit', color: '#F52B4F, #F37426', hover: '#F52B4F', width: '120px'},
      { title: 'Remove From Folder', action: 'remove_from_folder', color: '#606981, #ACB4C1', hover: '#606981', width: '150px'},
      { title: 'Delete Rooms', action: 'delete', color: '#DA2370,#FB434A', hover: '#DA2370',  width: '120px'}
  ];

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
      private elRef: ElementRef
  ) { }

  getHeaderData() {
    let colors;
    switch (this.overlayType) {
        case 'newRoom':
          // colors = '#03CF31,#00B476';
          this.titleColor = '#1F195E';
          this.roomName = 'New Room';
          break;
        case 'newFolder':
            if (!!this.pinnable) {
                colors = this.pinnable.gradient_color;
                this.folderName = this.pinnable.title;
                this.color_profile = this.pinnable.color_profile;
                this.selectedIcon = this.pinnable.icon;
                break;
            }
          // colors = '#03CF31,#00B476';
          this.titleColor = '#1F195E';
          this.folderName = 'New Folder';
          break;
        case 'editRoom':
            colors = this.pinnable.gradient_color;
            this.roomName = this.pinnable.title;
            this.timeLimit = this.pinnable.location.max_allowed_time;
            this.roomNumber = this.pinnable.location.room;
            this.selectedTeachers = this.pinnable.location.teachers;
            this.nowRestriction = this.pinnable.location.restricted;
            this.futureRestriction = this.pinnable.location.scheduling_restricted;
            this.color_profile = this.pinnable.color_profile;
            this.selectedIcon = this.pinnable.icon;
            this.travelType = this.pinnable.location.travel_types;
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
          this.bulkWarningText = !!_.find(this.selectedRooms, {type: 'category'});
          break;
    }
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  get isValidForm() {
      return this.form.get('roomName').valid && this.form.get('roomNumber').valid && this.form.get('timeLimit').valid;
  }

  get showPublishNewRoom() {
      return this.form.get('roomName').valid &&
             this.form.get('roomNumber').valid &&
             this.form.get('timeLimit').valid &&
             this.isDirtyNowRestriction &&
             this.isDirtyFutureRestriction &&
             !!this.color_profile && !!this.selectedIcon;
  }

  get showPublishEditRoom() {
     return this.isValidForm && this.isFormStateDirty;
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
     return this.isDirtyNowRestriction ||
      this.isDirtyFutureRestriction ||
      this.isDirtyTravel ||
      !!this.timeLimit;
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
            this.isDirtyTravel;
    }
  }

  get inactiveTogglePickerSettings() {
      return this.overlayType === 'newRoom' ||
          (this.overlayType === 'newRoomInFolder' && !this.editRoomInFolder) ||
          this.overlayType === 'settingsRooms' ||
          this.overlayType === 'edit';
  }
    ngOnInit() {
      disableBodyScroll(this.elRef.nativeElement,
          {
        allowTouchMove: (el) => {
          while (el && el !== this.elRef.nativeElement) {
            el = el.parentNode;
            return true;
          }
        }
      }
      );
      this.buildForm();

      this.overlayType = this.dialogData['type'];
      if (this.dialogData['pinnable']) {
          this.pinnable = this.dialogData['pinnable'];
          if (this.pinnable.type === 'category') {
              this.locationService.getLocationsWithCategory(this.pinnable.category)
                  .subscribe((res: Location[]) => this.selectedRooms = res);
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
              const filterLocations = _.filter(pinnables, {type: 'location'});
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

      fromEvent(this.selectedFile.nativeElement , 'change')
        .pipe(
          switchMap((evt: Event) => {
            this.setLocation('settingsRooms');

            const FR = new FileReader();
                  FR.readAsBinaryString(this.selectedFile.nativeElement.files[0]);
            return fromEvent(FR, 'load');
          }),
          map(( res: any) => {
            console.log('Result', res);
            const raw = XLSX.read(res.target.result, {type: 'binary'});
            const sn = raw.SheetNames[0];
            const stringCollection = raw.Sheets[sn];
            const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
            const headers = data[0];
            let rows = data.slice(1);
            rows = rows.map((row, index) => {
              console.log('Parsed room ===>', row);
              const _room: any = {};
              _room.title = row[0];
              _room.room = row[1];
              _room.teachers = <string>row[2] ? row[2].split(', ') : [];
              console.dir(_room);
              return _room;
            });
            return rows;
          }),
          switchMap((_rooms: any[]): Observable<any[]> => {
            return this.userService.getUsersList('_profile_teacher')
              .pipe(
                map((teachers: any[]) => {
                  return _rooms.map((_room) => {
                    const teachersIdArray = [];
                    teachers.map((_teacher) => {
                      if (_room.teachers.includes(_teacher.primary_email)) {
                        teachersIdArray.push(_teacher.id);
                      }
                    });
                    _room.teachers = teachersIdArray;
                    return _room;
                  });
                }));
            }),
          )
          .subscribe((rooms) => {
            this.importedRooms = rooms;
          });

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
              timeLimit: +this.timeLimit
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
            timeLimit: +this.timeLimit
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
    this.isDirtyIcon = true;
    this.changeState();
  }

  addToFolder() {
      this.isChangeLocations.next(true);
      this.pinnableToDeleteIds = this.selectedRoomsInFolder.map(pin => +pin.id);
      const locationsToAdd = this.selectedRoomsInFolder.map(room => room.location);
      this.selectedRooms = [...locationsToAdd, ...this.selectedRooms];
      this.setLocation('newFolder');
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
      this.roomList.topScroll = this.roomList.domElement.nativeElement.scrollTop;
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
              this.importedRooms = this.importedRooms.map((_room) => {
                  _room.restricted = this.nowRestriction;
                  _room.scheduling_restricted = this.futureRestriction;
                  _room.max_allowed_time = +this.timeLimit;
                  _room.travel_types = this.travelType;
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
         const selectedLocations = _.filter(this.selectedRooms, {type: 'location'}).map((res: any) => res.location);
          const locationsFromFolder = _.filter(this.selectedRooms, {type: 'category'}).map((folder: any) => {
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

  selectTeacherEvent(teachers) {
    this.selectedTeachers = teachers;
    this.isDirtysettings = true;
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

}
