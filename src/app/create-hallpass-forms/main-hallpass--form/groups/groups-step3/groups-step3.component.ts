import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StudentList} from '../../../../models/StudentList';
import {HttpService} from '../../../../http-service';
import {FormGroup} from '@angular/forms';
import {Navigation} from '../../main-hall-pass-form.component';
import {skip} from 'rxjs/internal/operators';

@Component({
  selector: 'app-groups-step3',
  templateUrl: './groups-step3.component.html',
  styleUrls: ['./groups-step3.component.scss']
})
export class GroupsStep3Component implements OnInit {

  @Input() form: FormGroup;
  @Input() editGroup: StudentList;

  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  public allowToSave: boolean = false;

  constructor(
    private http: HttpService
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
  }

  updateUsers(evt) {
    this.editGroup.users = evt;
    this.form.get('users').setValue(evt);
  }

  updateGroup() {

    const dto = this.form.value;
          dto.users = dto.users.map(user => user.id);

          if (dto.users.length) {

            this.http.patch(`v1/student_lists/${this.editGroup.id}`, dto)
              .subscribe((group) => {
                for ( const control in this.form.controls) {
                  this.form.controls[control].setValue(null);
                }
                this.back();
              });
          } else {
            this.removeGroup();
          }
  }

  removeGroup() {

    this.http.delete(`v1/student_lists/${this.editGroup.id}`)
      .subscribe((group: StudentList) => {
        for ( const control in this.form.controls) {
          this.form.controls[control].setValue(null);
        }
        this.back(group);
      });
  }
  back(updatedGroup?: StudentList) {

    this.stateChangeEvent.emit({
      step: 2,
      state: 1,
      fromState: 3,
      data: {
        selectedGroup: updatedGroup ? updatedGroup : this.editGroup
      }
    });
  }
}
