import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpService } from '../http-service';
import { TeacherSearchComponent } from '../teacher-search/teacher-search.component';
import { MessageService } from 'primeng/components/common/messageservice';
import {Message} from 'primeng/components/common/api';
import { DataService } from '../data-service';
import {User} from '../models';

@Component({
  selector: 'app-activate-pass',
  templateUrl: './activate-pass.component.html',
  styleUrls: ['./activate-pass.component.css']
})
export class ActivatePassComponent implements OnInit {

  @Input()
  pass;

  @Output() activatePassEvent: EventEmitter<boolean> = new EventEmitter();
  @ViewChild(TeacherSearchComponent) teacherComponent: TeacherSearchComponent;

  msgs:Message[] = [];

  barer;
  user:User;
  constructor(private http:HttpService, private messageService: MessageService, private dataService:DataService){ }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.dataService.currentUser.subscribe(user => this.user = user);
  }

  activate(){
    console.log(this.pass);
      let originValid = this.teacherComponent.validate();
      let originDuplicate = this.teacherComponent.selectedLocation.id == this.pass.to_location.id;
      if(!originValid){
        this.msgs.push({severity:'error', summary:'Field Invalid', detail:'The selected origin is not valid.'}); 
      } else if(originDuplicate){
        this.msgs.push({severity:'error', summary:'Field Invalid', detail:'Your origin cannot be the same as your destination.'});
      }else{
        let data = {
          'student': this.user.id,
          'pending_pass': this.pass.id,
          'from_location': this.teacherComponent.selectedLocation.id
        };
        this.teacherComponent.selectedLocation = null;
        var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
        this.http.post('api/methacton/v1/hall_passes', data, config).subscribe((data:any) => {
          console.log(data);
          this.activatePassEvent.emit(true);
          this.dataService.updateTab(1);
        });
    }
  }
}
