import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {cloneDeep, isEqual} from 'lodash';
import {EncountersState} from '../encounter-prevention-dialog.component';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss'],
})
export class CreateGroupComponent implements OnInit {

  form: FormGroup;
  @Input() state: EncountersState;

  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  isEdit: boolean;
  group: ExclusionGroup;
  groupInitialState: any;
  showSaveButton: boolean;

  constructor() { }

  ngOnInit(): void {
    this.isEdit = !!this.state.data.currentGroup;
    this.group = this.isEdit ? this.state.data.currentGroup : this.state.createGroup;
    this.form = new FormGroup({
      name: new FormControl(this.group.name),
      notes: new FormControl(this.group.notes)
    });

    this.groupInitialState = cloneDeep(this.group);
    this.form.valueChanges.subscribe((value) => {
      this.group = {...this.group, ...value};
      this.onUpdate();
    });
  }

  onUpdate() {
    this.showSaveButton = !isEqual(this.groupInitialState, this.group) || !this.isEdit;
    if (this.isEdit) {
      this.state.data.currentGroup = this.group;
    } else {
      this.state.createGroup = this.group;
    }
    this.update.emit({...this.state, data: {...this.state.data, ...this.form.value, showSaveButton: this.showSaveButton}});
  }

}
