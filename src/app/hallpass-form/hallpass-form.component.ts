import { Component, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { StudentSearchComponent } from '../student-search/student-search.component';
import { DurationPickerComponent } from '../duration-picker/duration-picker.component';
import { DateTimeComponent } from '../date-time/date-time.component';
import { TeacherSearchComponent } from '../teacher-search/teacher-search.component';
import {MessageService} from 'primeng/components/common/messageservice';
import {Message} from 'primeng/components/common/api';
@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.css']
})
export class HallpassFormComponent implements OnInit {
  @ViewChild(StudentSearchComponent) studentComponent: StudentSearchComponent;
  @ViewChild(TeacherSearchComponent) teacherComponent: TeacherSearchComponent;
  @ViewChild(DurationPickerComponent) durationComponent: DurationPickerComponent;
  @ViewChildren(DateTimeComponent) dateTimeComponent: QueryList<DateTimeComponent>;

  //General Set-Up
  public barer: string;
  public isLoggedIn: Boolean = false;
  public studentName: string;
  public user: string[];
  public gUser;
  public isStaff = false;
  public msgs: Message[] = [];
  constructor(private messageService: MessageService, private http: HttpService, private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    if (this.barer == '')
      this.router.navigate(['../']);
    else{
      this.dataService.currentUser.subscribe(user => this.user = user);
      this.isStaff = this.user['is_staff'];
      console.log('Hallpass form is staff:' + this.isStaff);
      this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);
      this.studentName = this.gUser['name'];
    }
  }

  newPass(){
    console.log('Making new pass');

    const studentsValid = this.studentComponent.validate();
    const destinationValid = this.teacherComponent.validate();
    const dateValid = this.dateTimeComponent.toArray()[0].validate();
    const timeValid = this.dateTimeComponent.toArray()[1].validate();
    const durationValid = this.durationComponent.validate();

    this.msgs = [];
    if (!studentsValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected student(s) are not valid.'});

    if (!destinationValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected destination is not valid.'});

    if (!dateValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected start date is not valid.'});

    if (!timeValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected start time is not valid.'});

    if (!durationValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected duration is not valid.'});

    if (!(studentsValid && destinationValid && dateValid && timeValid && durationValid))
      return;

    const destination: string = this.teacherComponent.selectedLocation.id;
    const date: Date = this.dateTimeComponent.toArray()[0].selectedDate;
    const time: Date = this.dateTimeComponent.toArray()[1].selectedTime;
    const finalDate = new Date();
    finalDate.setDate(date.getDate());
    finalDate.setTime(time.getTime());
    const duration = this.durationComponent.selectedDuration.value;

    let data: object;
    if (this.isStaff){
      const studentIds: string[] = [];
      this.studentComponent.selectedStudents.forEach(student => {
        studentIds.push(student.id);
      });
      data = {
              'students': studentIds,
              'description': '',
              'to_location': destination,
              'valid_time': duration,
              'start_time': finalDate.toISOString(),
              'from_location': null,
              'end_time': null
              };
      }
    const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
    this.http.post('api/methacton/v1/pending_passes', data, config).subscribe((data: any) => {
        console.log('Got data.');
    });
    this.studentComponent.selectedStudents = [];
    this.teacherComponent.selectedLocation = null;
    this.dateTimeComponent.toArray()[0].selectedDate = null;
    this.dateTimeComponent.toArray()[1].selectedTime = null;
    this.durationComponent.selectedDuration = null;
    this.dataService.updateTab(1);
  }


  async setupUserId(){
    const tempUser = await this.getUser();
    this.dataService.updateUser(tempUser);
  }

  getUser(){
    return new Promise((resolve, reject) => {

      const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};

      this.http.get('api/methacton/v1/users/@me', config).subscribe((data: any) => {
          this.user = data;
          resolve(data.id);
      }, reject);
    });
  }
}
