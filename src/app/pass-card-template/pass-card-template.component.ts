import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { User } from '../models/User';
import { Request} from '../models/Request';

@Component({
  selector: 'app-pass-card-template',
  templateUrl: './pass-card-template.component.html',
  styleUrls: ['./pass-card-template.component.scss']
})
export class PassCardTemplateComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() hasDivider: boolean = false;
  @Input() rightJustify: string = 'flex-end';
  @Input() hasClose: boolean = true;
  @Input() forStaff: boolean = false;
  @Input() selectedStudents: User[] = [];
  @Input() closeIcon: string;

  @Output() onCancel: EventEmitter<any> = new EventEmitter();

  constructor() {}

  get studentText() {
    return (this.selectedStudents?(this.selectedStudents.length > 2?this.selectedStudents[0].display_name + ' and ' +(this.selectedStudents.length-1) +' more':this.selectedStudents[0].display_name +(this.selectedStudents.length>1?' and ' +this.selectedStudents[1].display_name:'')):this.pass.student.display_name);
  }

  ngOnInit() {
    // console.log('SUKA gde dannye !!? ===> ', this.pass);
  }

  getGradient() {
    let gradient: string[] = this.pass.color_profile.gradient_color.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
  }

}
