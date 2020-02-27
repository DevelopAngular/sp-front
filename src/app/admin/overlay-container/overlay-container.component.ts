import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import {BehaviorSubject, forkJoin, merge, Observable, of, Subject, zip} from 'rxjs';
import {
  map,
  switchMap,
  filter,
  take,
  debounceTime,
  distinctUntilChanged,
  tap
} from 'rxjs/operators';

import { NextStep } from '../../animations';
import { Pinnable } from '../../models/Pinnable';
import { Location } from '../../models/Location';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import { HallPassesService } from '../../services/hall-passes.service';
import { LocationsService } from '../../services/locations.service';
import {OptionState, ValidButtons} from './advanced-options/advanced-options.component';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { FolderData, OverlayDataService, Pages, RoomData } from './overlay-data.service';
import { cloneDeep, filter as _filter, pullAll, isString, isNull, differenceBy } from 'lodash';
import {ColorProfile} from '../../models/ColorProfile';

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

  showPublishSpinner: boolean;
  iconTextResult$: Subject<string> = new Subject<string>();

  advOptState: OptionState = {
      now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
      future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
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
    if (this.currentPage === Pages.BulkEditRooms) {
      return this.roomValidButtons.getValue().incomplete;
    } else {
      return (this.roomValidButtons.getValue().incomplete ||
        !this.selectedIcon || !this.color_profile) && this.showCancelButton;
    }
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

      this.buildForm();

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
        })
      )
      .subscribe(() => {
      this.dialogRef.close();
    });
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
                max_allowed_time: +this.roomData.timeLimit,
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
              })
           )
         .subscribe(response => this.dialogRef.close(true));
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

        this.hallPassService.updatePinnableRequest(this.pinnable.id, newFolder)
          .subscribe(res => this.dialogRef.close(true));
      }
      if (this.folderData.roomsToDelete.length) {
        const deleteRequest$ = this.folderData.roomsToDelete.map(room => {
          return this.locationService.deleteLocationRequest(room.id).pipe(filter(res => !!res));
        });

        forkJoin(deleteRequest$).subscribe();
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
            return this.locationService.createLocationRequest(location)
              .pipe(filter(res => !!res));
          } else {
            id = location.id;
            data = location;
            data.category = this.folderData.folderName + salt;
            if (data.teachers) {
              data.teachers = data.teachers.map(teacher => +teacher.id);
            }

            return this.locationService.updateLocationRequest(id, data).pipe(
              filter(res => !!res)
            );
          }
        });
      } else {
        locationsToDb$ = [of(null)];
      }

      zip(...locationsToDb$).pipe(
        take(1),
        switchMap(locations => {
        const newFolder = {
          title: this.folderData.folderName,
          color_profile: this.color_profile.id,
          icon: this.selectedIcon.inactive_icon,
          category: this.folderData.folderName + salt
        };
        return this.currentPage === Pages.EditFolder
          ?
          this.hallPassService.updatePinnableRequest(this.pinnable.id, newFolder)
          :
          zip(
            this.hallPassService.pinnables$,
            this.hallPassService.postPinnableRequest(newFolder).pipe(filter(res => !!res)),
          ).pipe(
            take(1),
            switchMap((result: any[]) => {
              const arrengedSequence = result[0].map(item => item.id);
              arrengedSequence.push(result[1].id);
              return this.hallPassService.createArrangedPinnableRequest( { order: arrengedSequence.join(',')});
            })
          );
      }),
        take(1),
        switchMap((res) => {
          if (this.pinnableToDeleteIds.length) {
            const deleteRequests = this.pinnableToDeleteIds.map(id => {
              return this.hallPassService.deletePinnableRequest(id);
            });
            return forkJoin(deleteRequests);
          } else {
            return of(null);
          }
        })
      )
      .subscribe(() => this.dialogRef.close(true));
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
            })).subscribe(response => {
              this.dialogRef.close(true);
        });
    }

    if (this.currentPage === Pages.BulkEditRooms) {
      const patchRequests$ = (this.bulkEditData.rooms as Location[]).map(room => {
        return this.locationService.updateLocationRequest(room.id, room).pipe(
          filter(res => !!res));
      });

      zip(...patchRequests$).subscribe(res => {
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
      if (!isNull(roomData.restricted)) {
        room.restricted = roomData.restricted;
      }
      if (!isNull(roomData.scheduling_restricted)) {
        room.scheduling_restricted = roomData.scheduling_restricted;
      }
      if (roomData.travelType.length) {
        room.travel_types = roomData.travelType;
      }
      if (roomData.timeLimit) {
        room.max_allowed_time = roomData.timeLimit;
      }
      return {
        ...room,
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
      restricted: room.restricted,
      scheduling_restricted: room.scheduling_restricted,
      teachers: room.selectedTeachers,
      travel_types: room.travelType,
      max_allowed_time: +room.timeLimit,
    };
  }

  checkAllowedAdvOpt(options: OptionState, rooms: Location[]) {
    rooms.forEach(room => {
      if (!room.teachers.length) {
        if (options.now.state === 'Any teachers assigned' || options.now.state === 'All teachers assigned') {
          if (options.now.data.all_teach_assign === 'This Room') {
            options.now.data.all_teach_assign = 'Origin';
          }
        }
      }
    });
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
    // this.formService.setFrameMotionDirection('forward');
    setTimeout(() => {
      this.overlayService.changePage(Pages.EditRoomInFolder, 1, {
        selectedRoomsInFolder: [_room]
      });
    }, 10);
  }
}
