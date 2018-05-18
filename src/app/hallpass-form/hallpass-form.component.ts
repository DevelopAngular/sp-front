import { Component, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { StudentSearchComponent } from '../student-search/student-search.component';
import { DurationPickerComponent } from '../duration-picker/duration-picker.component';
import { DateTimeComponent } from '../date-time/date-time.component';
import { TeacherSearchComponent } from '../teacher-search/teacher-search.component';
import { MessageService} from 'primeng/components/common/messageservice';
import { Message} from 'primeng/components/common/api';
import { JSONSerializer } from '../models';
import { QuickpassPickerComponent } from '../quickpass-picker/quickpass-picker.component';
import { User } from '../models';
import { Pinnable, Location, Duration, HallPass, Request } from '../NewModels';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatePassComponent } from '../activate-pass/activate-pass.component';
import { LocationChooseComponent } from '../location-choose/location-choose.component';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { LocationTableComponent } from '../location-table/location-table.component';

@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.css']
})
export class HallpassFormComponent implements OnInit {
  // @ViewChild(StudentSearchComponent) studentComponent: StudentSearchComponent;
  // @ViewChildren(TeacherSearchComponent) teacherComponent: QueryList<TeacherSearchComponent>;
  // @ViewChild(DurationPickerComponent) durationComponent: DurationPickerComponent;
  // @ViewChildren(DateTimeComponent) dateTimeComponent: QueryList<DateTimeComponent>;
  // @ViewChild(QuickpassPickerComponent) quickPassComponent: QuickpassPickerComponent;
  // General Set-Up
  public barer: string;
  public isLoggedIn: Boolean = false;
  public studentName: string;
  public gUser;
  public isStaff = false;
  public msgs: Message[] = [];
  public isPending:boolean = true;

//------------------------NEW STUFF----------------------//
  user: User;
  show:boolean = false;
  passType:string = "rt";
  fromIcon:string = "../../assets/Search.png";
  toIcon:string = "../../assets/Search.png";
  from_title:string = "From";
  to_title:string = "To";
  toGradient:string = "radial-gradient(circle at 73% 71%, " +"#979797" +", " +"#505050" +")";
  fromGradient:string = "radial-gradient(circle at 73% 71%, " +"#979797" +", " +"#505050" +")";
  greenGradient = "#03cf31,#018155"
  locationType:string = "";
  fromLocation:Location;
  toLocation:Location;
  formState:string = "from"
  travelType:string = "round_trip"
  duration:number = 5;
  sliderDuration:number = 5;
  toState:string = "pinnables";
  toCategory:string = "";

  public pinnables:Promise<Pinnable[]>;

  constructor(private messageService: MessageService, private http: HttpService, private dataService: DataService, private router: Router, private serializer:JSONSerializer, public dialog: MatDialog, public dialogRef:MatDialogRef<HallpassFormComponent>, private sanitization:DomSanitizer) {}

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

  chooseLoc(loc){
    this.locationType = loc;
    if(loc == "to"){
      if(!!this.fromLocation){
        this.pinnables = this.http.get<Pinnable[]>('api/methacton/v1/pinnables').toPromise();
        this.formState = "to";
        this.toState = "pinnables";
      }
      else
        this.msgs.push({severity: 'error', summary: 'Attention!', detail: 'You must select a from location first.'});
    } else if(loc == "from"){
      let dialogRef = this.dialog.open(LocationChooseComponent, {
        width: '250px',
        hasBackdrop: true
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.fromLocation = result;
        this.from_title = this.fromLocation.title;
        this.fromIcon = "";
        this.setGradient("from", this.greenGradient);
        this.locationType = "to";
        if(!!result)
          this.formState = (this.formState == "fields")?"fields":"to";
          this.pinnables = this.http.get<Pinnable[]>('api/methacton/v1/pinnables').toPromise();                           
      });
    }
  }

  pinnableSelected(event:Pinnable){
    console.log("[Pinnable Selected]: ", event);
    if(event.type == "location"){
      if(this.locationType == 'to'){
        this.to_title = event.title;
        this.toIcon = "";
        this.setGradient("to", this.greenGradient);
        this.formState = "fields";
        this.toLocation = event.location;
      }
    } else if(event.type == "category"){
      this.toCategory = event.category;
      this.toState = "category";
    }
  }

  getCategoryListVisibility() {
    if(this.toState == "category") {
      return "block";
    } else {
      return "none";
    }
  }

  setGradient(type:string, gradient_color:string){
    let gradient: string[] = gradient_color.split(",");;

    if(type == 'to'){
      this.toGradient = "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
    } else if(type == 'from'){
      this.fromGradient = "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
    }
  }

  getGradient(type:string){
    if(type == 'to'){
      return this.toGradient;
    } else if(type == 'from'){
      return this.fromGradient;
    }
  }
  
  updateDuration(event:Duration){
    this.duration = event.value;
  }

  updateType(event:string){
    this.travelType = event;
    console.log(this.travelType);
  }

  locationChosen(event:Location){
    this.toState = "pinnables";
    this.formState = "fields";
    this.toLocation = event;
  }

  newRequest(message:string){
    let body = {
      'destination': this.toLocation.id,
      'attachment_message': message,
      'travel_type': this.travelType
      };

    this.http.post("api/methacton/v1/pass_requests", body, {headers:{'':''}}).subscribe((data) =>{
      console.log("Request POST Data: ", data);
      this.dialogRef.close(Request.fromJSON(data));
    });
  }

  newPass(){
    let body = {
      'student': this.user.id,
      'duration': this.duration,
      'origin': this.fromLocation.id,
      'destination': this.toLocation.id,
      'travel_type': this.travelType
      };

    this.http.post("api/methacton/v1/hall_passes", body, {headers:{'':''}}).subscribe((data) =>{
      console.log("Request POST Data: ", data);
      this.dialogRef.close(HallPass.fromJSON(data));
    });
  }

  // newPass(){
  //   //console.log("Making new pass");
  //   let issued:boolean;
  //   if(this.isStaff && this.isPending){
  //     //console.log("Issueing new pending pass");
  //     issued = this.newPendingPass();
  //   }
  //   else{
  //     //console.log("Issueing new hallpass");
  //     issued = this.newHallPass();
  //   }
  //   if(issued){
      
  //   }
  // }
  
  // newPendingPass():boolean{
  //   let studentsValid = this.studentComponent.validate();
  //   let destinationValid = this.teacherComponent.toArray()[0].validate();
  //   let dateValid = this.dateTimeComponent.toArray()[0].validate();
  //   let timeValid = this.dateTimeComponent.toArray()[1].validate();
  //   let durationValid = this.durationComponent.validate();

  //   let date:Date = this.dateTimeComponent.toArray()[0].selectedDate;
  //   let time:Date = this.dateTimeComponent.toArray()[1].selectedTime;
  //   let dateAsString = date.toISOString().split("T")[0];
  //   let timeAsString = time.toISOString().split("T")[1];
  //   let finalDate = new Date(dateAsString +"T" +timeAsString);

  //   let startValid = finalDate > new Date();

  //   this.msgs = [];
  //   if (!studentsValid)
  //     this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected student(s) are not valid.'});

  //   if (!destinationValid)
  //     this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected destination is not valid.'});

  //   if (!dateValid)
  //     this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected start date is not valid.'});

  //   if (!timeValid)
  //     this.msgs.push({severity: 'error', summary: 'Field Invalid', detail: 'The selected start time is not valid.'});

  //   if(!durationValid)
  //     this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected duration is not valid.'});
    
  //   if(!startValid){
  //     this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The start time cannot be in the past.'});
  //   }

  //   if(!(studentsValid && destinationValid && dateValid && timeValid && durationValid && startValid))
  //     return false;
    

    
  //   let destination:string = this.teacherComponent.toArray()[0].selectedLocation.id;
  //   const duration = this.durationComponent.selectedDuration.value;

  //   let data: object;
  //   if (this.isStaff){
  //     const studentIds: string[] = [];
  //     this.studentComponent.selectedStudents.forEach(student => {
  //       studentIds.push(student.id);
  //     });
  //     data = {
  //             'students': studentIds,
  //             'description': '',
  //             'to_location': destination,
  //             'valid_time': duration,
  //             'start_time': finalDate.toISOString(),
  //             'from_location': null,
  //             'end_time': null
  //             };
  //     }
  //   var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
  //   this.http.post('api/methacton/v1/pending_passes', data, config).subscribe((data:any) => {
  //     this.studentComponent.selectedStudents = [];
  //     this.teacherComponent.toArray()[0].selectedLocation = null;
  //     this.dateTimeComponent.toArray()[0].selectedDate = new Date();
  //     this.dateTimeComponent.toArray()[1].selectedTime = new Date();
  //     this.durationComponent.selectedDuration = null;
  //     this.dataService.updateTab(1);
  //   });

  //   return true;
  // }

  // newHallPass():boolean{
  //   if(this.isStaff)
  //     var studentsValid = this.studentComponent.validate();
  //   let destinationValid = this.teacherComponent.toArray()[0].validate();
  //   let originValid = this.teacherComponent.toArray()[1].validate();
  //   let durationValid = this.durationComponent.validate();

  //   this.msgs = [];
  //   if(!studentsValid && this.isStaff)
  //     this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected student(s) are not valid.'});

  //   if(!destinationValid)
  //     this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected destination is not valid.'});

  //   if(!originValid)
  //     this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected origin is not valid.'});

  //   if(!durationValid)
  //     this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected duration is not valid.'});
    
  //   if(this.isStaff)
  //     if(!(studentsValid && destinationValid && originValid && durationValid))
  //       return false;
  //     else if(!(destinationValid && originValid && durationValid)){
  //       return false;
  //     }
    
  //   let destination:string = this.teacherComponent.toArray()[0].selectedLocation.id;
  //   let origin:string = this.teacherComponent.toArray()[1].selectedLocation.id;
  //   let duration = this.durationComponent.selectedDuration.value;

  //   let data: object;
  //   let studentIds:string[] = [];
  //   if(this.isStaff){
  //     this.studentComponent.selectedStudents.forEach(student => {
  //       studentIds.push(student.id);
  //     });
  //   } else{
  //     studentIds.push(this.user.id);
  //   }
  //   data = {
  //           'students': studentIds,
  //           'description': '',
  //           'to_location': destination,
  //           'from_location': origin,
  //           'valid_time': duration,
  //           'end_time': null
  //           };
  //   var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
  //   this.http.post('api/methacton/v1/hall_passes', data, config).subscribe((data:any) => {
  //     console.log("Got hallpass data:");
  //     console.log(data);
  //     if(this.isStaff)
  //       this.studentComponent.selectedStudents = [];

  //     this.teacherComponent.toArray()[0].selectedLocation = null;
  //     this.teacherComponent.toArray()[1].selectedLocation = null;
  //     this.durationComponent.selectedDuration = null;

  //     if(!this.isStaff)
  //       this.quickPassComponent.selectedQuickpass = null;
        
  //     this.dataService.updateTab(1);
  //   });

  //   return true;
  // }

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

  // quickPassUpdate(event){
  //   //console.log("[Event]", event);
  //   if(!!event){
  //     //this.teacherComponent.toArray()[0].selectedLocation = this.serializer.getLocationFromJSON(event.to_location);
  //     this.durationComponent.selectedDuration = this.serializer.getDurationFromJSON(event.valid_time);
  //     //console.log("[Selected Time]", this.durationComponent.selectedDuration);
  //   }else{
  //     this.teacherComponent.toArray()[0].selectedLocation = null;
  //     this.durationComponent.selectedDuration = null;
  //   }
  // }

  dateToString(s:Date):string{
    //return s.toISOString();
    return s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
  }
}
