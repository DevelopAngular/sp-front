import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../http-service';
import {Navigation} from '../groups-container/groups-container.component';

@Component({
  selector: 'app-groups-step2',
  templateUrl: './groups-step2.component.html',
  styleUrls: ['./groups-step2.component.scss']
})
export class GroupsStep2Component implements OnInit {

  @Input() selectedStudents: User[] = [];
  @Input() form: FormGroup;

  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();


  constructor(
    private http: HttpService
  ) { }

  ngOnInit() {
  }

  nextStep() {

    const dto = this.form.value;
          dto.users = dto.users.map(user => user.id);

    this.http.post('v1/student_lists', dto)
      .subscribe((group) => {
        for ( const control in this.form.controls) {
          this.form.controls[control].setValue(null);
        }
        this.back();
      });
  }

  back() {
    this.stateChangeEvent.emit({
      state: 1,
      fromState: 2,
      data: []
    });
  }
}
