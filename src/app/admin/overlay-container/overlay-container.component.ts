import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import {forkJoin, Observable} from 'rxjs';
import {finalize, map, switchMap} from 'rxjs/operators';

import { Pinnable } from '../../models/Pinnable';
import * as _ from 'lodash';
import {User} from '../../models/User';
import {HttpService} from '../../http-service';
import { Location } from '../../models/Location';

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss']
})
export class OverlayContainerComponent implements OnInit {

  @ViewChild('file') selectedFile;

  selectedRooms = [];
  selectedRoomsInFolder: Pinnable[] = [];
  selectedTichers: User[] = [];
  readyRoomsToEdit: Pinnable[] = [];
  pinnable: Pinnable;
  pinnables$: Observable<Pinnable[]>;
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

  color_profile;
  selectedIcon;

  isDirtysettings: boolean;

  showSearchTeacherOptions: boolean;

  newRoomsInFolder = [];

  form: FormGroup;

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

  constructor(
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
      private http: HttpService,
  ) { }

  getHeaderData() {
    let colors;
    switch (this.overlayType) {
        case 'newRoom': {
          colors = '#03CF31,#00B476';
          this.roomName = 'New Room';
          break;
        }
        case 'newFolder': {
            if (!!this.pinnable) {
                colors = this.pinnable.gradient_color;
                this.folderName = this.pinnable.title;
                this.color_profile = this.pinnable.color_profile;
                this.selectedIcon = this.pinnable.icon;
                break;
            }
          colors = '#03CF31,#00B476';
          this.folderName = 'New Folder';
          break;
        }
        case 'editRoom': {
            colors = this.pinnable.gradient_color;
            this.roomName = this.pinnable.title;
            this.timeLimit = this.pinnable.location.max_allowed_time;
            this.roomNumber = this.pinnable.location.room;
            this.selectedTichers = this.pinnable.location.teachers;
            this.nowRestriction = this.pinnable.location.restricted;
            this.futureRestriction = this.pinnable.location.scheduling_restricted;
            this.color_profile = this.pinnable.color_profile;
            this.selectedIcon = this.pinnable.icon;
            this.travelType = this.pinnable.location.travel_types;
            break;
        }
        case 'edit': {
          colors = '#606981, #ACB4C1';
          this.folderName = 'Bulk Edit Rooms';
          break;
        }
    }
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  get isValidForm() {
      return this.form.get('roomName').valid && this.form.get('roomNumber').value && this.form.get('timeLimit').valid;
  }

  ngOnInit() {
      this.buildForm();

      this.overlayType = this.dialogData['type'];
      if (this.dialogData['pinnable']) {
          this.pinnable = this.dialogData['pinnable'];
          if (this.pinnable.type === 'category') {
              this.http.get(`v1/locations?category=${this.pinnable.category}&`)
                  .subscribe((res: Location[]) => this.selectedRooms = res);
          }
      }
      if (this.dialogData['rooms']) {
          this.selectedRooms = this.selectedRooms.concat(this.dialogData['rooms']);
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

      this.form.get('file').valueChanges.subscribe(res => {
          this.setLocation('settingsRooms');
      });
  }

  buildForm() {
    this.form = new FormGroup({
        // isEdit: new FormControl(true),
        file: new FormControl(),
        roomName: new FormControl('', [Validators.required, Validators.maxLength(17)]),
        folderName: new FormControl('', [Validators.required, Validators.maxLength(17)]),
        roomNumber: new FormControl('', [Validators.required, Validators.maxLength(5)]),
        timeLimit: new FormControl(null, [
            Validators.required,
            Validators.pattern('^[0-9]*?[0-9]+$'),
            Validators.min(1),
            Validators.max(59)
            ]
        )
    });
  }

  setLocation(location) {
    let type;
    let hideAppearance;
    switch (location) {
        case 'newRoomInFolder': {
          this.roomName = 'New Room';
          hideAppearance = true;
          type = 'newRoomInFolder';
          break;
        }
        case 'newFolder': {
          this.editRoomInFolder = false;
          this.selectedRoomsInFolder = [];
          this.selectedTichers = [];
          this.roomName = '';
          this.roomNumber = '';
          this.timeLimit = '';
          this.readyRoomsToEdit = [];
          this.isEditRooms = false;
          this.form.reset();
          this.isDirtysettings = false;
          hideAppearance = false;
          type = 'newFolder';
          break;
        }
        case 'importRooms': {
          hideAppearance = true;
          type = 'importRooms';
          break;
        }
        case 'addExisting': {
          hideAppearance = true;
          type = 'addExisting';
          break;
        }
        case 'settingsRooms': {
          hideAppearance = true;
          type = 'settingsRooms';
          break;
        }
        case 'editRoomInFolder': {
          this.editRoomInFolder = true;
          hideAppearance = true;
          type = 'newRoomInFolder';
        }
    }
    this.hideAppearance = hideAppearance;
    this.overlayType = type;
    return false;
  }

  changeColor(color) {
    this.color_profile = color;
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + color.gradient_color + ')';
    this.isDirtysettings = true;
  }

  changeIcon(icon) {
    this.selectedIcon = icon;
    this.isDirtysettings = true;
  }

  addToFolder() {
    this.selectedRooms = _.concat(this.selectedRooms, this.selectedRoomsInFolder);
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
      this.selectedTichers = room.teachers;
      this.nowRestriction = room.restricted;
      this.futureRestriction = room.scheduling_restricted;
      this.travelType = room.travel_types;

      this.setLocation('editRoomInFolder');

  }

  onCancel() {
    if (this.overlayType === 'newRoom') {
       const location = {
                title: this.roomName,
                room: this.roomNumber,
                restricted: this.nowRestriction,
                scheduling_restricted: this.futureRestriction,
                teachers: this.selectedTichers.map(teacher => teacher.id),
                travel_types: this.travelType,
                max_allowed_time: +this.timeLimit
        };

       this.http.post('v1/locations', location)
           .pipe(switchMap((loc: Location) => {
               const pinnable = {
                   title: this.roomName,
                   color_profile: this.color_profile.id,
                   icon: this.selectedIcon.inactive_icon,
                   location: loc.id,
               };
               return this.http.post('v1/pinnables', pinnable);
           })).subscribe(response => this.dialogRef.close());
    }

    if (this.overlayType === 'newFolder') {
        if (this.selectedRooms.length < 1) {
            const newFolder = {
                title: this.folderName,
                color_profile: this.color_profile.id,
                icon: this.selectedIcon.inactive_icon,
                category: this.folderName
            };
            this.http.patch(`v1/pinnables/${this.pinnable.id}`, newFolder).subscribe(res => this.dialogRef.close());
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
            return this.http.patch(`v1/locations/${id}`, data);
        });
        forkJoin(locationsToUpdate$).pipe(switchMap(locations => {
            const newFolder = {
                title: this.folderName,
                color_profile: this.color_profile.id,
                icon: this.selectedIcon.inactive_icon,
                category: this.folderName
            };
        return this.isEditFolder ? this.http.patch(`v1/pinnables/${this.pinnable.id}`, newFolder) : this.http.post('v1/pinnables', newFolder);
        })).subscribe(res => this.dialogRef.close(true));
    }
    if (this.overlayType === 'editRoom') {
        const location = {
            title: this.roomName,
            room: this.roomNumber,
            restricted: this.nowRestriction,
            scheduling_restricted: this.futureRestriction,
            teachers: this.selectedTichers.map(teacher => teacher.id),
            travel_types: this.travelType,
            max_allowed_time: +this.timeLimit
        };

        this.http.patch(`v1/locations/${this.pinnable.location.id}`, location)
            .pipe(switchMap((loc: Location) => {
                const pinnable = {
                    title: this.roomName,
                    color_profile: this.color_profile.id,
                    icon: this.selectedIcon.inactive_icon,
                    location: loc.id,
                };
                return this.http.patch(`v1/pinnables/${this.pinnable.id}`, pinnable);
            })).subscribe(response => this.dialogRef.close());
    }
  }

  done() {
      if (this.overlayType === 'newRoomInFolder') {
          const location = {
                  title: this.roomName,
                  room: this.roomNumber,
                  restricted: this.nowRestriction,
                  scheduling_restricted: this.futureRestriction,
                  teachers: this.selectedTichers.map(teacher => teacher.id),
                  travel_types: this.travelType,
                  max_allowed_time: +this.timeLimit
            };
          if (this.editRoomInFolder) {
              this.http.patch(`v1/locations/${this.roomToEdit.id}`, location).subscribe(res => {
                  this.selectedRooms = this.selectedRooms.filter(room => room.id !== this.roomToEdit.id);
                  this.selectedRooms.unshift(res);
                  this.setLocation('newFolder');
              });
          } else {
              this.http.post('v1/locations', location).subscribe(loc => {
                  this.newRoomsInFolder.push(loc);
                  this.selectedRooms.push(loc);
                  this.setLocation('newFolder');
              });
          }
      }
      if (this.overlayType === 'settingsRooms') {
          this.readyRoomsToEdit.forEach((room: any) => {
             this.selectedRooms.forEach(roomToEdit => {
                if (roomToEdit.id === room.id) {
                    room.restricted = this.nowRestriction;
                    room.scheduling_restricted = this.futureRestriction;
                    room.max_allowed_time = +this.timeLimit;
                }
             });
          });

          this.setLocation('newFolder');
       }

       if (this.overlayType === 'edit') {
         const selectedLocations = _.filter(this.selectedRooms, {type: 'location'}).map((res: any) => res.location);
          const locationsFromFolder = _.filter(this.selectedRooms, {type: 'category'}).map((folder: any) => {
             return  this.http.get(`v1/locations?category=${folder.category}&`);
          });
          forkJoin(locationsFromFolder).pipe(switchMap((res) => {
              const mergeLocations = _.concat(selectedLocations, ...res);
              const locationsToEdit = mergeLocations.map((room: any) => {
                  return this.http.patch(`v1/locations/${room.id}`,
                      {
                          restricted: this.nowRestriction,
                          scheduling_restricted: this.futureRestriction,
                          max_allowed_time: +this.timeLimit
                      });
              });
              return forkJoin(locationsToEdit);
          })).subscribe(() => this.dialogRef.close());
       }
  }

  requireValidator(value) {
    if (!value || value === '' || value === 'New Room' || value === 'New Folder') {
      return true;
    }
    return false;
  }

  selectedRoomsEvent(event, room) {
      if (event.checked) {
          this.readyRoomsToEdit.push(room);
      } else {
          this.readyRoomsToEdit = this.readyRoomsToEdit.filter(readyRoom => readyRoom.id !== room.id);
      }

  }

  onEditRooms(action) {
    if (action === 'edit') {
        this.isEditRooms = true;
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
            return this.http.delete(`v1/pinnables/${room.id}`);
        });
        forkJoin(roomsToDelete).subscribe(res => {
            const currentRoomsIds = this.readyRoomsToEdit.map(item => item.id);
            const allSelectedRoomsIds = this.selectedRooms.map(item => item.id);
            this.selectedRooms = this.selectedRooms.filter(item => {
                return item.id === _.pullAll(allSelectedRoomsIds, currentRoomsIds).find(id => item.id === id);
            });
            this.readyRoomsToEdit = [];
        });
    }
  }

  deleteRoom() {
      this.http.delete(`v1/pinnables/${this.pinnable.id}`).subscribe(res => {
          console.log(res);
          this.dialogRef.close();
      });
  }

  travelUpdate(type) {
   let travelType: string[];
   if (type === 'Round-trip') {
     travelType = ['round_trip'];
   } else if (type === 'One-way') {
     travelType = ['one_way'];
   } else if (type === 'Both') {
     travelType = ['round_trip', 'one_way'];
   }
   this.travelType = travelType;
   this.isDirtysettings = true;
  }

  nowRestrictionUpdate(restriction) {
    this.nowRestriction = restriction === 'Restricted';
    this.isDirtysettings = true;
  }

  futureRestrictionUpdate(restriction) {
    this.futureRestriction = restriction === 'Restricted';
    this.isDirtysettings = true;
  }

  selectTeacherEvent(teachers) {
    this.selectedTichers = teachers;
    this.isDirtysettings = true;
  }

  isEmitTeachers(event) {
      this.showSearchTeacherOptions = event;
  }

  onUpdate(time) {
      this.timeLimit = time;
  }
}
