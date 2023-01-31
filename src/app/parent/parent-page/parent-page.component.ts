import { Component, OnInit } from '@angular/core';
import { ScreenService } from '../../services/screen.service';
import { SideNavService } from '../../services/side-nav.service';

declare const window;

@Component({
	selector: 'app-parent-page',
	templateUrl: './parent-page.component.html',
	styleUrls: ['./parent-page.component.scss'],
})
export class ParentPageComponent implements OnInit {
	navbarHeight: string = '64px';
	hideNavbar: boolean;
	data: any;

	constructor(public screenService: ScreenService, private sideNavService: SideNavService) {}

	ngOnInit(): void {
		setTimeout(() => {
			window.appLoaded();
		}, 700);

		if (window.location.toString().includes('auth')) {
			this.hideNavbar = true;
		} else {
			this.hideNavbar = false;
		}
	}

	onSettingClick($event) {
		if (this.screenService.isDeviceLargeExtra) {
			this.data = $event;
			this.sideNavService.toggle$.next(true);
		}
	}
}
