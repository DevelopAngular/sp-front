import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {EncountersState} from '../encounter-prevention-dialog.component';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';

@Component({
  selector: 'app-encounter-group',
  templateUrl: './encounter-group.component.html',
  styleUrls: ['./encounter-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterGroupComponent implements OnInit {

  @Input() state: EncountersState;
  @Input() group: ExclusionGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
