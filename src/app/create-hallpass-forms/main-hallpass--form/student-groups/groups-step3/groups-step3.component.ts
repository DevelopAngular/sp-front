import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {StudentList} from '../../../../models/StudentList';
import {HttpService} from '../../../../services/http-service';
import {FormGroup} from '@angular/forms';
import {Navigation} from '../../main-hall-pass-form.component';
import { map, skip, switchMap} from 'rxjs/internal/operators';
import {UserService} from '../../../../services/user.service';
import {fromEvent, Observable} from 'rxjs';
import * as XLSX from 'xlsx';
import {User} from '../../../../models/User';

@Component({
  selector: 'app-groups-step3',
  templateUrl: './groups-step3.component.html',
  styleUrls: ['./groups-step3.component.scss']
})
export class GroupsStep3Component implements OnInit, AfterViewInit {
  @ViewChild('studentEmails') studentEmailsFile;

  @Input() form: FormGroup;
  @Input() editGroup: StudentList;

  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  public uploadedStudents: any;
  public loadingIndicator: boolean = false;

  public allowToSave: boolean = false;


  constructor(
    private http: HttpService,
    private userService: UserService,
    private changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.form.get('title').setValue(this.editGroup.title);
    this.form.get('users').setValue(this.editGroup.users);
    this.form.valueChanges
      .pipe(
        skip(1)
      )
      .subscribe((val: any) => {
        this.allowToSave = true;
      });

    fromEvent(this.studentEmailsFile.nativeElement , 'change')
      .pipe(
        switchMap((evt: Event) => {
          this.loadingIndicator = true;
          const FR = new FileReader();
          FR.readAsBinaryString(this.studentEmailsFile.nativeElement.files[0]);
          return fromEvent(FR, 'load');
        }),
        map(( res: any) => {
          console.log('Result', res);
          const raw = XLSX.read(res.target.result, {type: 'binary'});
          const sn = raw.SheetNames[0];
          const stringCollection = raw.Sheets[sn];
          const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
          const headers = data[0];
          console.log(data);
          return data.slice(1).map(item => item[0]);
        }),
        switchMap((_emails: string[]): Observable<any> => {

          console.log(_emails);

          return this.userService.getUsersList('_profile_student')
            .pipe(
              map((students: User[]) => {

                const result = {
                  existingStudents: [],
                  unknown: []
                };

                students.forEach((student) => {
                  const founded = _emails.findIndex(email => student.primary_email === email);
                  if (founded !== -1) {
                    result.existingStudents.push(student);
                    _emails.splice(founded, 1);
                  }
                });
                result.unknown = _emails;

                return result;
              }));
          // }));
        }))
      .subscribe((students) => {
        this.loadingIndicator = false;
        console.log(students);
        this.uploadedStudents = students;
        this.editGroup.users = this.editGroup.users.concat(students.existingStudents);
        this.updateUsers(this.editGroup.users);

        console.log(this.editGroup.users);

      });

  }
  ngAfterViewInit(): void {
    this.changeDetectionRef.detectChanges();
  }

  updateUsers(evt) {
    console.log('45 =>', evt);
    this.editGroup.users = evt;
    this.form.get('users').setValue(evt);
    this.form.get('users').markAsDirty();
  }

  updateGroup() {

    const dto = this.form.value;
          dto.users = dto.users.map(user => user.id);

          if (dto.users.length) {
            this.userService.updateStudentGroup(this.editGroup.id, dto)
              .subscribe((group: StudentList) => {
                  for ( const control in this.form.controls) {
                  this.form.controls[control].setValue(null);
                }
                this.back(group);
              });
          } else {
            this.removeGroup();
          }
  }

  removeGroup() {
    this.userService.deleteStudentGroup(this.editGroup.id)
      .subscribe((group: StudentList) => {
        console.log('Deleted users ====>', group);
        for ( const control in this.form.controls) {
          this.form.controls[control].setValue(null);
        }
        this.back(group);
      });
  }
  back(updatedGroup: StudentList) {
    this.form.get('title').reset();
    this.form.get('users').reset();
    this.stateChangeEvent.emit({
      step: 2,
      state: 1,
      fromState: 3,
      data: {
        selectedGroup: updatedGroup
      }
    });
  }
}
