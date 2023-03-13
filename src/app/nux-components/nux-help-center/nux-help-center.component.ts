import { Component, EventEmitter, Input, Output } from '@angular/core';
import { bumpIn } from '../../animations';

@Component({
	selector: 'app-nux-help-center',
	templateUrl: './nux-help-center.component.html',
	styleUrls: ['./nux-help-center.component.scss'],
	animations: [bumpIn],
})
export class NuxHelpCenterComponent {
	@Input() showBadge = true;
	@Input() description: string;
	// @Input() link: string;
	@Input() title: string;
	@Output() gotItEvent: EventEmitter<any> = new EventEmitter<any>();
}
