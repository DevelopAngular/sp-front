import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DropdownOptions<T> {
	title: string;
	value: T;
}

export interface DropdownConfig<T> {
	currentlySelected: DropdownOptions<T>;
	options: DropdownOptions<T>[];
	comparison?(opt1: T, opt2: T): boolean;
}

/**
 * DropdownSelectionComponent takes a generic list of options and displays on the screen
 * in a dialog window.
 * In addition to listing the options that are passed in, this component also highlights the
 * currently selected value;
 * For objects or custom-types, a comparison function should be passed in so the check for equality
 * can determine which item was selected. If a comparison function is not specified, the component will
 * assume that the option type is a primitive (number, string, boolean, etc.) and will be compared with ===
 */
@Component({
	selector: 'app-dropdown-selection',
	templateUrl: './dropdown-selection.component.html',
	styleUrls: ['./dropdown-selection.component.scss'],
})
export class DropdownSelectionComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: DropdownConfig<any>, private dialogRef: MatDialogRef<DropdownSelectionComponent>) {
		if (!data.comparison) {
			// if no comparison function is given, default to generic equality
			data.comparison = (opt1, opt2): boolean => opt1.value === opt2.value;
		}
	}

	isSelected(value): boolean {
		return this.data.comparison(this.data.currentlySelected, value);
	}

	selectOption(option) {
		this.dialogRef.close(option);
	}
}
