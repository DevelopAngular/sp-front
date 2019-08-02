import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import { BehaviorSubject, forkJoin, fromEvent, merge, Observable, of, Subject, zip } from 'rxjs';
import { delay, map, startWith, switchMap, filter } from 'rxjs/operators';

import { NextStep } from '../../animations';
import { User } from '../../models/User';
import { Pinnable } from '../../models/Pinnable';
import { Location } from '../../models/Location';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import { HallPassesService } from '../../services/hall-passes.service';
import { LocationsService } from '../../services/locations.service';
import {OptionState, ValidButtons} from './advanced-options/advanced-options.component';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { FolderData, OverlayDataService, Pages, RoomData } from './overlay-data.service';

import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss'],
  animations: [NextStep]

})
export class OverlayContainerComponent implements OnInit {

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

  @ViewChild('leftContent') set content(content: ElementRef) {
    this.roomList.domElement = content;
    // console.log(this.roomList);
    if (this.roomList.domElement) {
      // debugger
      this.roomList.ready.next(this.roomList.domElement);
    }
  }
  @ViewChild('dropArea') dropArea: ElementRef;

  // @ViewChild('file') set fileRef(fileRef: ElementRef) {
  //   if (fileRef && fileRef.nativeElement) {
  //     console.log(this.selectedFile);
  //     this.selectedFile = fileRef;
  //     fromEvent(this.selectedFile.nativeElement , 'change')
  //       .pipe(
  //         switchMap((evt: Event) => {
  //           this.uploadingProgress.inProgress = true;
  //
  //           const FR = new FileReader();
  //           FR.readAsBinaryString(this.selectedFile.nativeElement.files[0]);
  //           return fromEvent(FR, 'load');
  //         }),
  //         map(( res: any) => {
  //           const raw = XLSX.read(res.target.result, {type: 'binary'});
  //           const sn = raw.SheetNames[0];
  //           const stringCollection = raw.Sheets[sn];
  //           const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
  //           let rows = data.slice(1);
  //           rows = rows.map((row, index) => {
  //             const _room: any = {};
  //             _room.title = row[0];
  //             _room.room = row[1];
  //             _room.teachers = <string>row[2] ? row[2].split(', ') : [];
  //             return _room;
  //           });
  //           return rows;
  //         }),
  //         map((rows) => {
  //           rows = rows.map((r: any) => {
  //             if (r.title && r.title.length > 16) {
  //               r.title = r.title.slice(0, 15);
  //             }
  //             if (r.room && (r.room + '').length > 8) {
  //               r.title = r.title.slice(0, 7);
  //             }
  //             return r;
  //           });
  //           const groupedRooms = _.groupBy(rows, (r: any) => r.title);
  //           let normalizedRooms = [];
  //
  //           for (const key in groupedRooms) {
  //             if (groupedRooms[key].length > 1) {
  //               normalizedRooms = normalizedRooms.concat(
  //                 groupedRooms[key].map((duplicate: any, index: number) => {
  //                   duplicate.title = duplicate.title + ++index;
  //                   return duplicate;
  //                 })
  //               );
  //             } else {
  //               normalizedRooms = normalizedRooms.concat(groupedRooms[key]);
  //             }
  //           }
  //           return normalizedRooms;
  //         }),
  //         switchMap((_rooms: any[]): Observable<any[]> => {
  //           return this.userService.getUsersList('_profile_teacher')
  //             .pipe(
  //               map((teachers: any[]) => {
  //                 return _rooms.map((_room) => {
  //                   const teachersIdArray = [];
  //
  //                   _room.teachers.forEach((_teacherEmail) => {
  //                     const existAndAttached = teachers.find(_teacher =>  _teacher.primary_email === _teacherEmail );
  //                     if (existAndAttached) {
  //                       teachersIdArray.push(existAndAttached.id);
  //                     } else {
  //                       this.unknownEmails.push({
  //                         room: _room,
  //                         email: _teacherEmail
  //                       });
  //                     }
  //                   });
  //                   _room.teachers = teachersIdArray;
  //                   return _room;
  //                 });
  //               }));
  //         }),
  //       )
  //       .subscribe((rooms) => {
  //         setTimeout(() => {
  //           this.uploadingProgress.inProgress = false;
  //           this.uploadingProgress.completed = true;
  //         }, 1500);
  //         this.importedRooms = rooms;
  //       });
  //   }
  // }

  selectedFile: ElementRef;
  selectedRooms = [];

  selectedRoomsEditable = {};
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
  isEditRooms = false;
  isEditFolder = false;
  editRoomInFolder: boolean;
  roomToEdit: Location;
  importedRooms: any[] = [];

  color_profile;
  selectedIcon;

  icons$: Observable<any>;
  roomNameBlur$: Subject<string> = new Subject();
  folderNameBlur$: Subject<string> = new Subject();

  titleIcon: string;
  isDirtyColor: boolean;
  isDirtyIcon: boolean;

  isChangeState: boolean;
  isChangeStateInFolder: boolean;

  isChangeLocations = new BehaviorSubject<boolean>(false);

  folderRoomsLoaded: boolean;

  pinnableToDeleteIds: number[] = [];

  titleColor = 'white';

  form: FormGroup;

  showPublishSpinner: boolean;
  showDoneSpinner: boolean;

  advOptState: OptionState = {
      now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
      future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
  };

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
  frameMotion$: BehaviorSubject<any>;

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
                  icon: _.cloneDeep(this.selectedIcon),
                  color: _.cloneDeep(this.color_profile)
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
              icon: _.cloneDeep(this.selectedIcon),
              color: _.cloneDeep(this.color_profile)
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

  get isValidForm() {
    return this.form.get('roomName').valid &&
      this.form.get('roomNumber').valid &&
      this.form.get('timeLimit').valid;

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

  get showPublishButton() {
    if (this.currentPage === Pages.EditRoom || this.currentPage === Pages.NewRoom  || this.currentPage === Pages.NewFolder || this.currentPage === Pages.EditFolder) {
      return this.roomValidButtons.getValue().publish &&
        !!this.selectedIcon &&
        !!this.color_profile ||
        this.isDirtyIcon ||
        this.isDirtyColor && !this.disabledRightBlock;
    } else if (this.currentPage === Pages.BulkEditRooms) {
      return this.roomValidButtons.getValue().publish;
    }
  }

  get showIncompleteButton() {
      return this.roomValidButtons.getValue().incomplete && !this.disabledRightBlock;
  }

  get showCancelButton() {
      return (this.roomValidButtons.getValue().cancel || this.isDirtyIcon || this.isDirtyColor) && !this.disabledRightBlock;
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    this.overlayService.pageState.pipe(filter(res => !!res)).subscribe(res => {
       this.currentPage = res.currentPage;
    });

      this.roomList.ready.asObservable()
        .pipe(
          filter(el => !!el),
          delay(50)
        )
        .subscribe((el: ElementRef) => {
        if (this.overlayType === 'newFolder' && this.roomList.topScroll) {
          el.nativeElement.scrollTop = this.roomList.topScroll;
        } else {
          el.nativeElement.scrollTop = 0;
        }
      });
      this.buildForm();

      this.overlayType = this.dialogData['type'];
      if (this.dialogData['pinnable']) {
        this.pinnable = this.dialogData['pinnable'];
      }
      if (this.dialogData['rooms']) {
        this.pinnableToDeleteIds = this.dialogData['rooms'].map(pin => +pin.id);
        this.selectedRooms = this.dialogData['rooms'];
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

      if (this.currentPage === Pages.EditFolder || this.currentPage === Pages.EditRoom || this.currentPage === Pages.EditRoomInFolder) {
          this.icons$ = merge(
              this.form.get('roomName').valueChanges.pipe(startWith(this.form.get('roomName').value)),
              this.form.get('folderName').valueChanges.pipe(startWith(this.form.get('folderName').value))
          )
              .pipe(
                  filter(value => value),
                  switchMap((value: string) => this.http.searchIcons(value.toLowerCase()))
              );
      } else {
          this.icons$ = merge(
              this.roomNameBlur$,
              this.folderNameBlur$
          ).pipe(
              filter(value => !!value),
              switchMap((value: string) => this.http.searchIcons(value.toLowerCase()))
          );
      }

      this.form.valueChanges.subscribe(res => {
          if (!!res.file || !!res.roomName || !!res.folderName || !!res.roomNumber || !!res.timeLimit) {
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
        file: new FormControl(),
        roomName: new FormControl('',
            [Validators.required, Validators.maxLength(15)],
            this.uniqueRoomNameValidator.bind(this)),
        folderName: new FormControl('',
            [Validators.required, Validators.maxLength(17)],
            this.uniqueFolderNameValidator.bind(this)),
        roomNumber: new FormControl('',
            [Validators.required, Validators.maxLength(5)]),
        timeLimit: new FormControl('', [
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
      if (control.dirty) {
          return this.locationService.checkLocationName(control.value)
              .pipe(map((res: any) => {
                  if (this.currentPage === Pages.NewRoom || Pages.NewRoomInFolder) {
                      return res.title_used ? { room_name: true } : null;
                  }
                  return res.title_used &&
                  (this.currentPage === Pages.EditRoomInFolder ?
                      this.overlayService.pageState.getValue().data.selectedRoomsInFolder[0].title : this.pinnable.location.title) !== this.roomData.roomName ? { room_name: true } : null;
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
          return res.title_used && this.pinnable.title !== this.folderName ? { folder_name: true } : null;
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
      if (roomData.advOptState.now.state === 'Any teacher (default)') {
          data.request_mode = 'any_teacher';
          data.request_send_origin_teachers = true;
          data.request_send_destination_teachers = true;
      } else if (roomData.advOptState.now.state === 'Any teachers assigned') {
          data.request_mode = 'teacher_in_room';
      } else if (roomData.advOptState.now.state === 'All teachers assigned') {
          data.request_mode = 'all_teachers_in_room';
      } else if (roomData.advOptState.now.state === 'Certain \n teacher(s)') {
          data.request_mode = 'specific_teachers';
      }
      if (roomData.advOptState.future.state === 'Any teacher (default)') {
          data.scheduling_request_mode = 'any_teacher';
          data.scheduling_request_send_origin_teachers = true;
          data.scheduling_request_send_destination_teachers = true;
      } else if (roomData.advOptState.future.state === 'Any teachers assigned') {
          data.scheduling_request_mode = 'teacher_in_room';
      } else if (roomData.advOptState.future.state === 'All teachers assigned') {
          data.scheduling_request_mode = 'all_teachers_in_room';
      } else if (roomData.advOptState.future.state === 'Certain \n teacher(s)') {
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
        // this.resetRoomImport();
        const oldFolderData = this.oldFolderData ? this.oldFolderData : this.folderData;

        this.overlayService.back({...this.folderData, oldFolderData});
        // return (this.overlayType === 'settingsRooms' ? (this.isEditRooms ? this.setLocation('newFolder') : this.setLocation('importRooms')) : this.setLocation('newFolder'));
      }, 100);
    }
  }

  onPublish() {
    this.showPublishSpinner = true;
    if (this.currentPage === Pages.NewRoom) {
       const location = {
                title: this.roomData.roomName,
                room: this.roomData.roomNumber,
                restricted: this.roomData.restricted,
                scheduling_restricted: this.roomData.scheduling_restricted,
                teachers: this.roomData.selectedTeachers.map(teacher => teacher.id),
                travel_types: this.roomData.travelType,
                max_allowed_time: +this.roomData.timeLimit
        };
       this.locationService.createLocation(location)
           .pipe(switchMap((locationToUpdate: Location) => {
               const data = this.normalizeAdvOptData();
               return this.locationService.updateLocation(locationToUpdate.id, data);
               }),
               switchMap((loc: Location) => {
               const pinnable = {
                   title: this.roomData.roomName,
                   color_profile: this.color_profile.id,
                   icon: this.selectedIcon.inactive_icon,
                   location: loc.id,
               };
               return this.hallPassService.createPinnable(pinnable);
           })).subscribe(response => this.dialogRef.close());
    }

    if (this.currentPage === Pages.NewFolder || this.currentPage === Pages.EditFolder) {
      const locationsToDb$ = this.folderData.roomsInFolder.map(location => {
        let id;
        let data;
        if (_.isString(location.id)) {
          location.category = this.folderData.folderName;
          location.teachers = location.teachers.map(t => t.id);
          return this.locationService.createLocation(location).pipe(switchMap((loc: Location) => {
            return this.locationService.updateLocation(loc.id, location);
          }));
        } else {
          id = location.id;
          data = location;
          data.category = this.folderData.folderName;
          if (data.teachers) {
            data.teachers = data.teachers.map(teacher => +teacher.id);
          }
          return this.locationService.updateLocation(id, data);
        }
      });

      forkJoin(locationsToDb$).pipe(switchMap(locations => {
        const newFolder = {
          title: this.folderData.folderName,
          color_profile: this.color_profile.id,
          icon: this.selectedIcon.inactive_icon,
          category: this.folderData.folderName
        };
        return this.currentPage === Pages.EditFolder
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
      }),
        switchMap(() => {
          if (this.pinnableToDeleteIds.length) {
            const deleteRequests = this.pinnableToDeleteIds.map(id => this.hallPassService.deletePinnable(id));
            return zip(...deleteRequests);
          } else {
            return of(null);
          }
        })
      )
      .subscribe(() => this.dialogRef.close());
    }

    if (this.currentPage === Pages.EditRoom) {
        const location = {
            title: this.roomData.roomName,
            room: this.roomData.roomNumber,
            restricted: this.roomData.restricted,
            scheduling_restricted: this.roomData.scheduling_restricted,
            teachers: this.roomData.selectedTeachers.map(teacher => teacher.id),
            travel_types: this.roomData.travelType,
            max_allowed_time: +this.roomData.timeLimit
        };

        const mergedData = {...location, ...this.normalizeAdvOptData()};

        this.locationService.updateLocation(this.pinnable.location.id, mergedData)
            .pipe(switchMap((loc: Location) => {
                const pinnable = {
                    title: this.roomData.roomName,
                    color_profile: this.color_profile.id,
                    icon: this.selectedIcon.inactive_icon,
                    location: loc.id,
                };
                return this.hallPassService.updatePinnable(this.pinnable.id, pinnable);
            })).subscribe(response => this.dialogRef.close());
    }

    if (this.currentPage === Pages.BulkEditRooms) {
      const patchRequests$ = (this.bulkEditData.rooms as Location[]).map(room => {
        return this.locationService.updateLocation(room.id, room);
      });

      forkJoin(patchRequests$).subscribe(res => {
        this.dialogRef.close();
      });
    }
  }

  // done() {
  //     this.showDoneSpinner = true;
  //
  //     if (this.overlayType === 'newRoomInFolder') {
  //         const location = {
  //                 title: this.roomName,
  //                 room: this.roomNumber,
  //                 restricted: this.nowRestriction,
  //                 scheduling_restricted: this.futureRestriction,
  //                 // teachers: this.selectedTeachers.map(teacher => teacher.id),
  //                 teachers: this.selectedTeachers,
  //                 travel_types: this.travelType,
  //                 max_allowed_time: +this.timeLimit,
  //           };
  //
  //       if (this.editRoomInFolder) {
  //               const currentRoom = this.selectedRooms.find(room => room.id === this.roomToEdit.id);
  //               currentRoom.title = location.title;
  //               this.selectedRoomsEditable[this.roomToEdit.id] = ({id : this.roomToEdit.id, ...location, ...this.normalizeAdvOptData()});
  //               this.isChangeLocations.next(true);
  //       } else {
  //           this.selectedRoomsEditable[location.title] = ({id : null, ...location, ...this.normalizeAdvOptData()});
  //           this.selectedRooms.push({...location, ...this.normalizeAdvOptData()});
  //           this.isChangeLocations.next(true);
  //         }
  //     }
  //     if (this.overlayType === 'settingsRooms') {
  //         if (this.importedRooms.length) {
  //             this.importedRooms = this.importedRooms.map((_room, index) => {
  //                 _room.restricted = this.nowRestriction;
  //                 _room.scheduling_restricted = this.futureRestriction;
  //                 _room.max_allowed_time = +this.timeLimit;
  //                 _room.travel_types = this.travelType;
  //                 // setTimeout(() => {}, 100);
  //                 return this.locationService.createLocation(_room);
  //             });
  //             zip(...this.importedRooms).subscribe((result) => {
  //                 this.selectedRooms = [...result, ...this.selectedRooms];
  //                 this.isChangeLocations.next(true);
  //             });
  //
  //         } else if (this.readyRoomsToEdit.length) {
  //             const locationsToEdit = this.readyRoomsToEdit.map(room => {
  //                 if (room.location) {
  //                     const data: any = {
  //                         restricted: this.nowRestriction,
  //                         scheduling_restricted: this.futureRestriction,
  //                         travel_types: this.travelType
  //                     };
  //                     if (this.timeLimit) {
  //                         data.max_allowed_time =  +this.timeLimit;
  //                     }
  //                     return this.locationService.updateLocation(room.location.id, data);
  //                 } else {
  //                     const data: any = {
  //                         restricted: this.nowRestriction,
  //                         scheduling_restricted: this.futureRestriction,
  //                         travel_types: this.travelType
  //                     };
  //                     if (this.timeLimit) {
  //                         data.max_allowed_time =  +this.timeLimit;
  //                     }
  //                     return this.locationService.updateLocation(room.id, data);
  //                 }
  //             });
  //             forkJoin(locationsToEdit).subscribe(res => {
  //                 const locIds = res.map((loc: Location) => loc.id);
  //                 const newCollection = this.selectedRooms.filter(room => room.id !== locIds.find(id => id === room.id));
  //                 this.selectedRooms = [...res, ...newCollection];
  //                 this.isChangeLocations.next(true);
  //             });
  //         }
  //      }
  //
  //    if (this.overlayType === 'edit') {
  //      this.showPublishSpinner = true;
  //      const selectedLocations = _.filter<Location | Pinnable>(this.selectedRooms, {type: 'location'}).map((res: any) => res.location);
  //       const locationsFromFolder = _.filter<Location | Pinnable>(this.selectedRooms, {type: 'category'}).map((folder: any) => {
  //           return this.locationService.getLocationsWithCategory(folder.category);
  //       });
  //       if (locationsFromFolder.length) {
  //           forkJoin(locationsFromFolder).pipe(switchMap((res) => {
  //               const mergeLocations = _.concat(selectedLocations, ...res);
  //               const locationsToEdit = mergeLocations.map((room: any) => {
  //                   const data: any = {
  //                       restricted: this.nowRestriction,
  //                       scheduling_restricted: this.futureRestriction,
  //                       travel_types: this.travelType
  //                   };
  //                   if (this.timeLimit) {
  //                       data.max_allowed_time =  +this.timeLimit;
  //                   }
  //                   return this.locationService.updateLocation(room.id, data);
  //               });
  //               return forkJoin(locationsToEdit);
  //           })).subscribe(() => this.dialogRef.close());
  //       } else {
  //           const locationsToEdit = selectedLocations.map((room: any) => {
  //               const data: any = {
  //                   restricted: this.nowRestriction,
  //                   scheduling_restricted: this.futureRestriction,
  //                   travel_types: this.travelType
  //               };
  //               if (this.timeLimit) {
  //                   data.max_allowed_time =  +this.timeLimit;
  //               }
  //               return this.locationService.updateLocation(room.id, data);
  //           });
  //           forkJoin(locationsToEdit).subscribe(() => this.dialogRef.close());
  //       }
  //    }
  // }

  // onEditRooms(action) {
  //   // this.formService.setFrameMotionDirection('forward');
  //
  //   setTimeout(() => {
  //     if (action === 'edit') {
  //       this.isEditRooms = true;
  //     }
  //     if (action === 'remove_from_folder') {
  //       const currentRoomsIds = this.readyRoomsToEdit.map(item => item.id);
  //       const allSelectedRoomsIds = this.selectedRooms.map(item => item.id);
  //       this.selectedRooms = this.selectedRooms.filter(item => {
  //         return item.id === _.pullAll(allSelectedRoomsIds, currentRoomsIds).find(id => item.id === id);
  //       });
  //       this.readyRoomsToEdit = [];
  //     }
  //     if (action === 'delete') {
  //       const roomsToDelete = this.readyRoomsToEdit.map(room => {
  //         return this.locationService.deleteLocation(room.id);
  //       });
  //       forkJoin(roomsToDelete).subscribe(res => {
  //         const currentRoomsIds = this.readyRoomsToEdit.map(item => item.id);
  //         const allSelectedRoomsIds = this.selectedRooms.map(item => item.id);
  //         this.selectedRooms = this.selectedRooms.filter(item => {
  //           return item.id === _.pullAll(allSelectedRoomsIds, currentRoomsIds).find(id => item.id === id);
  //         });
  //         this.readyRoomsToEdit = [];
  //         this.isChangeLocations.next(true);
  //       });
  //     }
  //   }, 100);
  // }

  // deleteRoom() {
  //   if (this.overlayType === 'editRoom' || (this.isEditFolder && this.overlayType === 'newFolder')) {
  //
  //     const deletions = [
  //       this.hallPassService.deletePinnable(this.pinnable.id)
  //     ];
  //
  //     if (this.pinnable.location) {
  //       deletions.push(this.locationService.deleteLocation(this.pinnable.location.id));
  //     }
  //
  //     zip(...deletions).subscribe(res => {
  //       console.log(res);
  //       this.dialogRef.close();
  //     });
  //   }
  //
  //   if (this.editRoomInFolder) {
  //       this.locationService.deleteLocation(this.currentLocationInEditRoomFolder.id)
  //       .subscribe((res: Location) => {
  //           this.selectedRooms = this.selectedRooms.filter(room => room.id !== this.currentLocationInEditRoomFolder.id);
  //           this.isChangeLocations.next(true);
  //       });
  //   }
  //
  // }

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

  onUpdate(time) {
      this.timeLimit = time;
  }

  handleDragEvent( evt: DragEvent, dropAreaColor: string) {
    evt.preventDefault();
    this.overlayService.dragEvent$.next(dropAreaColor);
    // if (this.dropArea && this.dropArea.nativeElement && this.getRoomImportScreen() === 1) {
    //
    //   this.dropArea.nativeElement.style.borderColor = dropAreaColor;
    // }
  }

  getRoomImportScreen() {
    if (!this.importedRooms.length || !this.uploadingProgress.completed) {
      return 1;
    } else if (this.importedRooms.length && this.unknownEmails.length && this.uploadingProgress.completed) {
      return 2;
    } else if (this.importedRooms.length && !this.unknownEmails.length) {
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

  roomResult({data, buttonState}) {
      this.roomData = data;
      this.roomValidButtons.next(buttonState);
  }

  folderResult({data, buttonState}) {
      this.folderData = data;
      this.roomValidButtons.next(buttonState);
  }

  newRoomInFolder(room: RoomData) {
      this.oldFolderData = _.cloneDeep(this.folderData);
      this.folderData.roomsInFolder.push({...this.normalizeRoomData(room), ...this.normalizeAdvOptData(room)});
      this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData});
  }

  editRoomFolder(room: RoomData) {
    this.oldFolderData = _.cloneDeep(this.folderData);
    this.folderData.roomsInFolder = this.folderData.roomsInFolder.filter(r => r.id !== room.id);
    this.folderData.roomsInFolder.push({...this.normalizeRoomData(room), ...this.normalizeAdvOptData(room)});
    this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData});
  }

  addToFolder(rooms: any[]) {
    this.oldFolderData = _.cloneDeep(this.folderData);
    this.pinnableToDeleteIds = rooms.map(pin => +pin.id);
    const locationsToAdd = rooms.map(room => room.location);
    this.folderData.roomsInFolder = [...locationsToAdd, ...this.folderData.roomsInFolder];
    this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData});
  }

  bulkEditInFolder({roomData, rooms}) {
    this.oldFolderData = _.cloneDeep(this.folderData);
    this.folderData.roomsInFolder = _.differenceBy(this.folderData.roomsInFolder, rooms, 'id');
    this.editRooms(roomData, rooms);
    this.folderData.roomsInFolder = [...rooms, ...this.folderData.roomsInFolder];
    this.overlayService.back({...this.folderData, oldFolderData: this.oldFolderData});
  }

  bulkEditResult({roomData, rooms, buttonState}) {
    this.editRooms(roomData, rooms);
    this.bulkEditData = {roomData, rooms};
    this.roomValidButtons.next(buttonState);
  }

  editRooms(roomData, rooms) {
    rooms.forEach(room => {
      if (!_.isNull(roomData.restricted)) {
        room.restricted = roomData.restricted;
      }
      if (!_.isNull(roomData.scheduling_restricted)) {
        room.scheduling_restricted = roomData.scheduling_restricted;
      }
      if (!_.isNull(roomData.travelType.length)) {
        room.travel_types = roomData.travelType;
      }
      if (roomData.timeLimit) {
        room.max_allowed_time = roomData.timeLimit;
      }
    });
  }

  normalizeRoomData(room) {
    return {
      id: room.id,
      title: room.roomName,
      room: room.roomNumber,
      restricted: room.restricted,
      scheduling_restricted: room.scheduling_restricted,
      teachers: room.selectedTeachers,
      travel_types: room.travelType,
      max_allowed_time: +room.timeLimit,
    };
  }

  catchFile(evt: DragEvent) {
    evt.preventDefault();
    this.uploadingProgress.inProgress = true;
    this.overlayService.dropEvent$.next(evt);

    // of(evt)
    //   .pipe(
    //     switchMap((dragEvt: DragEvent) => {
    //       const FR = new FileReader();
    //       FR.readAsBinaryString(dragEvt.dataTransfer.files[0]);
    //       return fromEvent(FR, 'load');
    //     }),
    //     map(( res: any) => {
    //       const raw = XLSX.read(res.target.result, {type: 'binary'});
    //       const sn = raw.SheetNames[0];
    //       const stringCollection = raw.Sheets[sn];
    //       const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
    //       let rows = data.slice(1);
    //       rows = rows.map((row, index) => {
    //         const _room: any = {};
    //         _room.title = row[0];
    //         _room.room = row[1];
    //         _room.teachers = <string>row[2] ? row[2].split(', ') : [];
    //         return _room;
    //       });
    //       return rows;
    //     }),
    //     map((rows) => {
    //       rows = rows.map((r: any) => {
    //         if (r.title && r.title.length > 16) {
    //           r.title = r.title.slice(0, 15);
    //         }
    //         if (r.room && (r.room + '').length > 8) {
    //           r.title = r.title.slice(0, 7);
    //         }
    //         return r;
    //       });
    //       const groupedRooms = _.groupBy(rows, (r: any) => r.title);
    //       let normalizedRooms = [];
    //       console.log(groupedRooms);
    //
    //       for (const key in groupedRooms) {
    //         if (groupedRooms[key].length > 1) {
    //           normalizedRooms = normalizedRooms.concat(
    //             groupedRooms[key].map((duplicate: any, index: number) => {
    //               duplicate.title = duplicate.title + ++index;
    //               return duplicate;
    //             })
    //           );
    //         } else {
    //           normalizedRooms = normalizedRooms.concat(groupedRooms[key]);
    //         }
    //       }
    //       console.log(normalizedRooms);
    //       return normalizedRooms;
    //     }),
    //     switchMap((_rooms: any[]): Observable<any[]> => {
    //         console.log(_rooms);
    //       return this.userService.getUsersList('_profile_teacher')
    //         .pipe(
    //           map((teachers: any[]) => {
    //
    //             return _rooms.map((_room) => {
    //                       const teachersIdArray = [];
    //
    //                       _room.teachers.forEach((_teacherEmail) => {
    //                         const existAndAttached = teachers.find(_teacher =>  _teacher.primary_email === _teacherEmail );
    //                         if (existAndAttached) {
    //                           teachersIdArray.push(existAndAttached.id);
    //                         } else {
    //                           this.unknownEmails.push({
    //                             room: _room,
    //                             email: _teacherEmail
    //                           });
    //                         }
    //                       });
    //
    //                       _room.teachers = teachersIdArray;
    //                       return _room;
    //                   });
    //           }));
    //     }),
    //   )
    //   .subscribe((rooms) => {
    //     console.log(rooms);
    //     console.log(this.unknownEmails);
    //       setTimeout(() => {
    //         this.uploadingProgress.inProgress = false;
    //         this.uploadingProgress.completed = true;
    //       }, 1500);
    //     this.importedRooms = rooms;
    //   });
  }
}
