import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data-service';

@Component({
  selector: 'app-pass-info',
  templateUrl: './pass-info.component.html',
  styleUrls: ['./pass-info.component.css']
})
export class PassInfoComponent implements OnInit {

  @Input()
  pass;

  @Input()
  isPending;

  @Input()
  forTeacher;

  passDate;
  duration;
  user;
  constructor(private dataService:DataService) { }

  ngOnInit() {
    //this.dataService.currentUser.subscribe(user => this.user = user);
    let s = new Date(this.pass.created);
    this.passDate = s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
    this.duration = this.pass.valid_time/600;
  }

}
