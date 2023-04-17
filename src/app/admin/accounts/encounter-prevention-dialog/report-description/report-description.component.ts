import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { resizeReportDescription } from '../../../../animations';
import { ExclusionGroup, PreventEncounters } from '../../../../models/ExclusionGroup';

@Component({
	selector: 'app-report-description',
	templateUrl: './report-description.component.html',
	styleUrls: ['./report-description.component.scss'],
	animations: [resizeReportDescription],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDescriptionComponent implements OnInit {
	@Input() date: string;
	@Input() encounter: PreventEncounters;
	@Input() group: ExclusionGroup;

	@ViewChild('wrapper') wrapper: ElementRef;

	animationTrigger: any;
	isOpen: boolean = true;

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit() {}

	setStartHeight() {
		this.isOpen = !this.isOpen;
		this.animationTrigger = { value: this.isOpen ? 'open' : 'close', params: { startHeight: this.wrapper.nativeElement.clientHeight } };
		this.cdr.detectChanges();
	}
}
