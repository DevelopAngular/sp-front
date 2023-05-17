import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { findIndex, pullAll } from 'lodash';
import { Select } from '../animations';

@Component({
	selector: 'app-restriction-picker',
	templateUrl: './restriction-picker.component.html',
	styleUrls: ['./restriction-picker.component.scss'],
	animations: [Select],
})
export class RestrictionPickerComponent implements OnInit {
	@Input() choices: string[];
	@Input() width: number; // px
	@Input() height = 32; // px
	@Input() color = '#7F879D';
	@Input() selectedColor = '#FFFFFF';
	@Input() backgroundColor = '#1E194F';
	@Input() selectedChoice: string;
	@Input() fontSize = 13; // px
	@Input() disabled: boolean;
	@Input() disabledOptions: string[];
	@Input() padding = 5; // px
	@Input() tooltipText: string;

	@Output() result: EventEmitter<string> = new EventEmitter<string>();

	public ngOnInit(): void {
		if (this.selectedChoice) {
			if (this.disabledOptions && this.choices.length - this.disabledOptions.length === 1) {
				this.selectedChoice = pullAll([...this.choices], [...this.disabledOptions])[0];
			}
			this.result.emit(this.selectedChoice);
		}
	}

	public isDisabled(option: string): boolean {
		return (
			findIndex(this.disabledOptions, (opt) => {
				return option === opt;
			}) > -1
		);
	}

	public onClick(choice: string): void {
		if (!this.isDisabled(choice)) {
			this.selectedChoice = choice;
			this.result.emit(choice);
		}
	}
}
