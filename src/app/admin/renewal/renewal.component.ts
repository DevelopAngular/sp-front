import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-renewal',
	templateUrl: './renewal.component.html',
	styleUrls: ['./renewal.component.scss'],
})
export class RenewalComponent implements OnInit {
	public selectedFeature = 0;

	ngOnInit(): void {}

	handleFeatureClick(clicked: number) {
		if (this.selectedFeature === clicked) {
			this.selectedFeature = 0;
		} else {
			this.selectedFeature = clicked;
		}
	}
}
