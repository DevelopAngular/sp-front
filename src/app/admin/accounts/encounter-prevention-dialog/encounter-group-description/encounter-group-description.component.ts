import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { EncountersState } from '../encounter-prevention-dialog.component';
import { ExclusionGroup } from '../../../../models/ExclusionGroup';

@Component({
	selector: 'app-encounter-group-description',
	templateUrl: './encounter-group-description.component.html',
	styleUrls: ['./encounter-group-description.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncounterGroupDescriptionComponent implements OnInit {
	@Input() state: EncountersState;
	@Input() group: ExclusionGroup;

	constructor() {}

	ngOnInit(): void {
		this.group.prevented_encounters = this.group.prevented_encounters.reverse();
	}

}
