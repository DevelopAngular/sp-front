import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
	selector: 'app-renewal-box',
	templateUrl: './renewal-box.component.html',
	styleUrls: ['./renewal-box.component.scss'],
})
export class RenewalBoxComponent implements OnInit {
	public expiring: boolean;

	constructor(public router: Router, private adminService: AdminService) {}

	ngOnInit(): void {
		this.adminService.getRenewalData().subscribe({
			next: (data) => {
				this.expiring = data.renewal_status === 'expiring';
			},
		});
	}

	navToRenewalPage() {
		this.router.navigate(['admin/renewal']);
	}
}
