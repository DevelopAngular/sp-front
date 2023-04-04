import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NavbarElementsRefsService } from '../../../services/navbar-elements-refs.service';

@Component({
	selector: 'app-renewal-box',
	templateUrl: './renewal-box.component.html',
	styleUrls: ['./renewal-box.component.scss'],
})
export class RenewalBoxComponent implements OnInit {
	public expiring: boolean;
	public onRenewalPage: boolean;

	constructor(public router: Router, private adminService: AdminService, private navbarService: NavbarElementsRefsService) {}

	ngOnInit(): void {
		this.adminService.getRenewalData().subscribe({
			next: (data) => {
				this.expiring = data.renewal_status === 'expiring';
			},
		});

		this.navbarService.getRenewalReminderFill().subscribe((fill) => {
			this.onRenewalPage = fill;
		});
	}

	navToRenewalPage() {
		this.router.navigate(['admin/renewal']);
	}
}
