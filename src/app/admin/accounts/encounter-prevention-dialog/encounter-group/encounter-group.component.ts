import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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

  @Output() clickEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
