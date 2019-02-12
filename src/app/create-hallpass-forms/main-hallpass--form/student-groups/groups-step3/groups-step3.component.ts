import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StudentList} from '../../../../models/StudentList';
import {HttpService} from '../../../../services/http-service';
import {FormGroup} from '@angular/forms';
import {Navigation} from '../../main-hall-pass-form.component';
import {skip} from 'rxjs/internal/operators';
import {ApiService} from '../../../../services/api.service';

@Component({
  selector: 'app-groups-step3',
  templateUrl: './groups-step3.component.html',
  styleUrls: ['./groups-step3.component.scss']
})
export class GroupsStep3Component implements OnInit, AfterViewInit {

  @Input() form: FormGroup;
  @Input() editGroup: StudentList;

  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  public allowToSave: boolean = false;

  constructor(
    private http: HttpService,
    private apiSevice: ApiService,
    private changeDetectionRef: ChangeDetectorRef
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
  ngAfterViewInit(): void {
    this.changeDetectionRef.detectChanges();
  }

  updateUsers(evt) {
    console.log('45 =>', evt);
    this.editGroup.users = evt;
    this.form.get('users').setValue(evt);
    this.form.get('users').markAsDirty();
  }

  updateGroup() {

    const dto = this.form.value;
          dto.users = dto.users.map(user => user.id);

          if (dto.users.length) {
            this.apiSevice.updateStudentGroup(this.editGroup.id, dto)
              .subscribe((group: StudentList) => {
                  for ( const control in this.form.controls) {
                  this.form.controls[control].setValue(null);
                }
                this.back(group);
              });
          } else {
            this.removeGroup();
          }
  }

  removeGroup() {
    this.apiSevice.deleteStudentGroup(this.editGroup.id)
      .subscribe((group: StudentList) => {
        for ( const control in this.form.controls) {
          this.form.controls[control].setValue(null);
        }
        this.back(group);
      });
  }
  back(updatedGroup: StudentList) {
    this.form.get('title').reset();
    this.form.get('users').reset();
    this.stateChangeEvent.emit({
      step: 2,
      state: 1,
      fromState: 3,
      data: {
        selectedGroup: updatedGroup
      }
    });
  }
}
