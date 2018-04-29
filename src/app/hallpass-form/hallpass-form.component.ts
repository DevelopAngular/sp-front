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
import { JSONSerializer } from '../models';
import { QuickpassPickerComponent } from '../quickpass-picker/quickpass-picker.component';
import {User} from '../models';

@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.css']
})
export class HallpassFormComponent implements OnInit {
  @ViewChild(StudentSearchComponent) studentComponent: StudentSearchComponent;
  @ViewChildren(TeacherSearchComponent) teacherComponent: QueryList<TeacherSearchComponent>;
  @ViewChild(DurationPickerComponent) durationComponent: DurationPickerComponent;
  @ViewChildren(DateTimeComponent) dateTimeComponent: QueryList<DateTimeComponent>;
  @ViewChild(QuickpassPickerComponent) quickPassComponent: QuickpassPickerComponent;
  //General Set-Up
  public barer: string;
  public isLoggedIn: Boolean = false;
  public studentName: string;
  public user: User;
  public gUser;
  public isStaff = false;
  public msgs: Message[] = [];
  public isPending:boolean = true;

  constructor(private messageService: MessageService, private http: HttpService, private dataService: DataService, private router: Router, private serializer:JSONSerializer) {}

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    if (this.barer == '')
      this.router.navigate(['../']);
    else{
      this.dataService.currentUser.subscribe(user => this.user = user);
      //console.log(this.user.roles);
      this.isStaff = this.user.roles.includes('edit_all_hallpass');
      //console.log('Hallpass form is staff:' + this.isStaff);
      this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);
      this.studentName = this.gUser['name'];
    }
  }

  newPass(){
    //console.log("Making new pass");
    let issued:boolean;
    if(this.isStaff && this.isPending){
      //console.log("Issueing new pending pass");
      issued = this.newPendingPass();
    }
    else{
      //console.log("Issueing new hallpass");
      issued = this.newHallPass();
    }
    if(issued){
      
    }
  }
 
  
  newPendingPass():boolean{
    let studentsValid = this.studentComponent.validate();
    let destinationValid = this.teacherComponent.toArray()[0].validate();
    let dateValid = this.dateTimeComponent.toArray()[0].validate();
    let timeValid = this.dateTimeComponent.toArray()[1].validate();
    let durationValid = this.durationComponent.validate();

    this.msgs = [];
    if (!studentsValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected student(s) are not valid.'});

    if (!destinationValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected destination is not valid.'});

    if (!dateValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected start date is not valid.'});

    if (!timeValid)
      this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected start time is not valid.'});

    if(!durationValid)
      this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected duration is not valid.'});
    
    if(!(studentsValid && destinationValid && dateValid && timeValid && durationValid))
      return false;
    
    let destination:string = this.teacherComponent.toArray()[0].selectedLocation.id;
    let date:Date = this.dateTimeComponent.toArray()[0].selectedDate;
    let time:Date = this.dateTimeComponent.toArray()[1].selectedTime;
    let dateAsString = date.toISOString().split("T")[0];
    let timeAsString = time.toISOString().split("T")[1];
    console.log("[DUBUG]", "Date: ", dateAsString, "Time: ", timeAsString);
    let finalDate = new Date(dateAsString +"T" +timeAsString);
    console.log("[DUBUG]", "Final Date: ", this.dateToString(finalDate));
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
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    this.http.post('api/methacton/v1/pending_passes', data, config).subscribe((data:any) => {
      this.studentComponent.selectedStudents = [];
      this.teacherComponent.toArray()[0].selectedLocation = null;
      this.dateTimeComponent.toArray()[0].selectedDate = new Date();
      this.dateTimeComponent.toArray()[1].selectedTime = new Date();
      this.durationComponent.selectedDuration = null;
      this.dataService.updateTab(1);
    });

    return true;
  }

  newHallPass():boolean{
    if(this.isStaff)
      var studentsValid = this.studentComponent.validate();
    let destinationValid = this.teacherComponent.toArray()[0].validate();
    let originValid = this.teacherComponent.toArray()[1].validate();
    let durationValid = this.durationComponent.validate();

    this.msgs = [];
    if(!studentsValid && this.isStaff)
      this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected student(s) are not valid.'});

    if(!destinationValid)
      this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected destination is not valid.'});

    if(!originValid)
      this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected origin is not valid.'});

    if(!durationValid)
      this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected duration is not valid.'});
    
    if(this.isStaff)
      if(!(studentsValid && destinationValid && originValid && durationValid))
        return false;
      else if(!(destinationValid && originValid && durationValid)){
        return false;
      }
    
    let destination:string = this.teacherComponent.toArray()[0].selectedLocation.id;
    let origin:string = this.teacherComponent.toArray()[1].selectedLocation.id;
    let duration = this.durationComponent.selectedDuration.value;

    let data: object;
    let studentIds:string[] = [];
    if(this.isStaff){
      this.studentComponent.selectedStudents.forEach(student => {
        studentIds.push(student.id);
      });
    } else{
      studentIds.push(this.user.id);
    }
    data = {
            'students': studentIds,
            'description': '',
            'to_location': destination,
            'from_location': origin,
            'valid_time': duration,
            'end_time': null
            };
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    this.http.post('api/methacton/v1/hall_passes', data, config).subscribe((data:any) => {
      console.log("Got hallpass data:");
      console.log(data);
      if(this.isStaff)
        this.studentComponent.selectedStudents = [];

      this.teacherComponent.toArray()[0].selectedLocation = null;
      this.teacherComponent.toArray()[1].selectedLocation = null;
      this.durationComponent.selectedDuration = null;

      if(!this.isStaff)
        this.quickPassComponent.selectedQuickpass = null;
        
      this.dataService.updateTab(1);
    });

    return true;
  }

  async setupUserId(){
    await this.getUser();
    this.dataService.updateUser(this.user);
  }

  getUser(){
    return new Promise((resolve, reject) => {

      const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};

      this.http.get('api/methacton/v1/users/@me', config).subscribe((data: any) => {
          this.user = this.serializer.getUserFromJSON(data);
          resolve(this.user);
      }, reject);
    });
  }

  quickPassUpdate(event){
    //console.log("[Event]", event);
    if(!!event){
      this.teacherComponent.toArray()[0].selectedLocation = this.serializer.getLocationFromJSON(event.to_location);
      this.durationComponent.selectedDuration = this.serializer.getDurationFromJSON(event.valid_time);
      //console.log("[Selected Time]", this.durationComponent.selectedDuration);
    }else{
      this.teacherComponent.toArray()[0].selectedLocation = null;
      this.durationComponent.selectedDuration = null;
    }
  }

  dateToString(s:Date):string{
    //return s.toISOString();
    return s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
  }
}
