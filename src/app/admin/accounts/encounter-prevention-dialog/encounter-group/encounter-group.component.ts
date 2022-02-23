import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';
import {bumpIn} from '../../../../animations';

@Component({
  selector: 'app-encounter-group',
  templateUrl: './encounter-group.component.html',
  styleUrls: ['./encounter-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [bumpIn]
})
export class EncounterGroupComponent implements OnInit {

  @Input() group: ExclusionGroup;
  @Input() backgroundColor: string;

  @Output() clickEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
