import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../../../../models/User';
import {FormGroup} from '@angular/forms';
import {Navigation} from '../../main-hall-pass-form.component';
import {UserService} from '../../../../services/user.service';
import {fromEvent, Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import {DeviceDetection} from '../../../../device-detection.helper';


@Component({
  selector: 'app-groups-step2',
  templateUrl: './groups-step2.component.html',
  styleUrls: ['./groups-step2.component.scss']
})
export class GroupsStep2Component implements OnInit {


  @ViewChild('studentEmails') studentEmailsFile;

  @Input() selectedStudents: User[] = [];
  @Input() form: FormGroup;

  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  public uploadedStudents: any;
  public loadingIndicator: boolean = false;
  public uploadingError: string;
  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {

    fromEvent(this.studentEmailsFile.nativeElement , 'change')
      .pipe(
        switchMap((evt: Event) => {
          this.loadingIndicator = true;
          const FR = new FileReader();
          FR.readAsBinaryString(this.studentEmailsFile.nativeElement.files[0]);
          return fromEvent(FR, 'load');
        }),
        map(( res: any) => {
          // console.log('Result', res);
          const raw = XLSX.read(res.target.result, {type: 'binary'});
          const sn = raw.SheetNames[0];
          const stringCollection = raw.Sheets[sn];
          const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
          const headers = data[0];
          console.log(data);
          return data.slice(1).map(item => item[0]);
        }),
        switchMap((_emails: string[]): Observable<any> => {

          // console.log(_emails);

          return this.userService.getAccountsRoles('_profile_student')
            .pipe(
              map((students: User[]) => {
                // console.log(students);
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
                })
                result.unknown = _emails;

                return result;
              }));
        }),
        catchError((err) => {
          this.loadingIndicator = false;
          console.log(err.message);
          this.uploadingError = err.message;
          return throwError(err);
        })
      )
      .subscribe((students) => {
        this.loadingIndicator = false;
        console.log(students);
        this.uploadedStudents = students;
        this.selectedStudents = _.uniqBy(this.selectedStudents.concat(students.existingStudents), 'id');
        this.form.get('users').setValue(this.selectedStudents);
        this.test();
      });

  }

  test() {
    console.log(this.selectedStudents, this.form.value);
  }

  nextStep() {
    const dto = this.form.value;
          dto.users = dto.users.map(user => user.id);
    // console.log(dto);
    this.userService.createStudentGroupRequest(dto)
      .subscribe((group) => {
        for ( const control in this.form.controls) {
          this.form.controls[control].setValue(null);
        }
        this.back();
      });
  }

  back() {
    this.stateChangeEvent.emit({
      step: 2,
      state: 1,
      fromState: 2,
      data: {
        selectedStudents: this.selectedStudents
      }
    });
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
