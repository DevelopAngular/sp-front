import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../../../models/User';
import {FormControl, FormGroup} from '@angular/forms';
import {Navigation} from '../../main-hall-pass-form.component';
import {ApiService} from '../../../../services/api.service';

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
    private apiService: ApiService
  ) { }

  ngOnInit() {
  }

  nextStep() {

    const dto = this.form.value;
          dto.users = dto.users.map(user => user.id);
    this.apiService.createStudentGroup(dto)
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
}
