import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {fromEvent, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {UserService} from '../../../services/user.service';
import {OverlayDataService, Pages} from '../overlay-data.service';

import {groupBy} from 'lodash';
import * as XLSX from 'xlsx';

export interface RoomInfo {
  id: string;
  title: string;
  room: string;
  teachers: string[];
}

@Component({
  selector: 'app-import-rooms',
  templateUrl: './import-rooms.component.html',
  styleUrls: ['./import-rooms.component.scss']
})
export class ImportRoomsComponent implements OnInit {

  @Input() form: FormGroup;

  @Output() back = new EventEmitter();

  @ViewChild('dropArea') dropArea: ElementRef;

  @ViewChild('file', { static: true }) set fileRef(fileRef: ElementRef) {
    if (fileRef && fileRef.nativeElement) {
      console.log(this.selectedFile);
      this.selectedFile = fileRef;
      fromEvent(this.selectedFile.nativeElement , 'change')
        .pipe(
          switchMap((evt: Event) => {
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
            const rows = data.slice(1);
            return rows.map((row, index) => {
              return {
                id: `Fake ${Math.floor(Math.random() * (1 - 1000)) + 1000}`,
                title: ('' + row[0]).trim(),
                room: ('' + row[1]).trim(),
                teachers: <string>row[2] ? row[2].split(',').map(t => t.trim()) : [],
              };
            });
          }),
          map((rows: RoomInfo[]) => {
            rows = rows.map((r: RoomInfo) => {
              if (r.title.length > 15) {
                r.title = r.title.slice(0, 15);
              }
              if (r.room.length > 5) {
                r.room = r.room.slice(0, 5);
              }
              return r;
            });
            const groupedRooms = groupBy(rows, (r: RoomInfo) => r.title.toLowerCase());
            let normalizedRooms: RoomInfo[] = [];

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
            return normalizedRooms;
          }),
          switchMap((_rooms: any[]): Observable<any[]> => {
            return this.userService.getUsersList('_profile_teacher')
              .pipe(
                map((teachers: any[]) => {
                  return _rooms.map((_room) => {
                    const teachersArray = [];

                    _room.teachers.forEach((_teacherEmail) => {
                      const existAndAttached = teachers.find(_teacher =>  _teacher.primary_email === _teacherEmail );
                      if (existAndAttached) {
                        teachersArray.push(existAndAttached);
                      } else {
                        this.unknownEmails.push({
                          room: _room,
                          email: _teacherEmail
                        });
                      }
                    });
                    _room.teachers = teachersArray;
                    return _room;
                  });
                }));
          }),
        )
        .subscribe((rooms) => {
          setTimeout(() => {
            this.uploadingProgress.inProgress = false;
            this.uploadingProgress.completed = true;
          }, 1500);
          this.importedRooms = rooms;
        });
    }
  }

  unknownEmails: any[] = [];

  importedRooms: any[] = [];

  uploadingProgress: {
    inProgress: boolean,
    completed: boolean,
    percent: number
  } = {
    inProgress: false,
    completed: false,
    percent: 0
  };

  selectedFile: ElementRef;

  constructor(private userService: UserService, private overlay: OverlayDataService) { }

  get showCancel() {
    return this.importedRooms.length && this.uploadingProgress.completed;
  }

  get showIncomplete() {
    return this.importedRooms.length && this.uploadingProgress.completed;
  }

  ngOnInit() {

    this.overlay.dropEvent$
      .pipe(
        switchMap((dragEvt: DragEvent) => {
          this.uploadingProgress.inProgress = true;
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
            return {
              id: `Fake ${Math.floor(Math.random() * (1 - 1000)) + 1000}`,
              title: ('' + row[0]).trim(),
              room: ('' + row[1]).trim(),
              teachers: <string>row[2] ? row[2].split(',').map(t => t.trim()) : [],
            };
          });
          return rows;
        }),
        map((rows) => {
          rows = rows.map((r: any) => {
            if (r.title && r.title.length > 16) {
              r.title = r.title.slice(0, 15);
            }
            if (r.room && r.room.length > 8) {
              r.room = r.room.slice(0, 7);
            }
            return r;
          });
          const groupedRooms = groupBy(rows, (r: any) => r.title);
          let normalizedRooms = [];

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

          return normalizedRooms;
        }),
        switchMap((_rooms: any[]): Observable<any[]> => {
          console.log(_rooms);
          return this.userService.getUsersList('_profile_teacher')
            .pipe(
              map((teachers: any[]) => {

                return _rooms.map((_room) => {
                  const teachersArray = [];

                  _room.teachers.forEach((_teacherEmail) => {
                    const existAndAttached = teachers.find(_teacher =>  _teacher.primary_email === _teacherEmail );
                    if (existAndAttached) {
                      teachersArray.push(existAndAttached);
                    } else {
                      this.unknownEmails.push({
                        room: _room,
                        email: _teacherEmail
                      });
                    }
                  });

                  _room.teachers = teachersArray;
                  return _room;
                });
              }));
        }),
      )
      .subscribe((rooms) => {
        setTimeout(() => {
          this.uploadingProgress.inProgress = false;
          this.uploadingProgress.completed = true;
        }, 1500);
        this.importedRooms = rooms;
      });

    this.overlay.dragEvent$.subscribe((dropAreaColor) => {
      if (this.dropArea && this.dropArea.nativeElement && this.getRoomImportScreen() === 1) {

        this.dropArea.nativeElement.style.borderColor = dropAreaColor;
      }
    });
  }

  goBack() {
    this.back.emit();
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

  getRoomImportScreen() {
    if (!this.importedRooms.length || !this.uploadingProgress.completed) {
      return 1;
    } else if (this.importedRooms.length && this.unknownEmails.length && this.uploadingProgress.completed) {
      return 2;
    } else if (this.importedRooms.length && !this.unknownEmails.length) {
      this.redirect();
    }
  }

  redirect() {
    this.overlay.changePage(Pages.BulkEditRoomsInFolder, Pages.ImportRooms, {
      selectedRoomsInFolder: this.importedRooms
    });
  }

}
