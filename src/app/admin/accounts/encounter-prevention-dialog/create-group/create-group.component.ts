import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {EncountersState} from '../encounter-prevention-dialog.component';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {

  form: FormGroup;
  @Input() state: EncountersState;

  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    if (this.state.data.currentGroup) {
      this.form = new FormGroup({
        group_name: new FormControl(this.state.data.currentGroup.name),
        notes: new FormControl(this.state.data.currentGroup.notes)
      });
    } else {
      debugger;
      this.form = new FormGroup({
        group_name: new FormControl(this.state.createGroup.group_name),
        notes: new FormControl(this.state.createGroup.notes)
      });
    }
    this.form.valueChanges.subscribe(() => {
      this.onUpdate();
    });
  }

  onUpdate() {
    this.update.emit({...this.state, data: {...this.state.data, ...this.form.value}});
  }

}
