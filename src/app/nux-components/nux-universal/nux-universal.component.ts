import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-nux-universal',
	templateUrl: './nux-universal.component.html',
	styleUrls: ['./nux-universal.component.scss'],
})
export class NuxUniversalComponent {
	@Input() showBadge = true;
	@Input() description: string;
	@Input() link: string;
	@Input() learnMoreText: string = 'Learn More';
	@Input() dismissText: string = 'Got it!';
	@Output() gotItEvent: EventEmitter<any> = new EventEmitter<any>();
}
