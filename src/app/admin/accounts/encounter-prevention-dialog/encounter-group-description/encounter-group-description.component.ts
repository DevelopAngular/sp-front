import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {EncountersState} from '../encounter-prevention-dialog.component';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';
import * as moment from 'moment';

@Component({
  selector: 'app-encounter-group-description',
  templateUrl: './encounter-group-description.component.html',
  styleUrls: ['./encounter-group-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterGroupDescriptionComponent implements OnInit {

  @Input() state: EncountersState;
  @Input() group: ExclusionGroup;

  constructor() { }

  ngOnInit(): void {
    console.log(this.group);
  }

  getDate(date) {
    return moment(date).format('MMM. DD, YYYY');
  }

}
