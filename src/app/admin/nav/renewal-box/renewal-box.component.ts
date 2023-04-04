import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NavbarElementsRefsService } from '../../../services/navbar-elements-refs.service';
import { HttpService } from '../../../services/http-service';
import { filter, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
	selector: 'app-renewal-box',
	templateUrl: './renewal-box.component.html',
	styleUrls: ['./renewal-box.component.scss'],
})
export class RenewalBoxComponent implements OnInit {
	public expiring: boolean;
	public onRenewalPage: boolean;
	public showBox: boolean;

	constructor(
		public router: Router,
		private http: HttpService,
		private adminService: AdminService,
		private navbarService: NavbarElementsRefsService
	) {}

	ngOnInit(): void {
		this.http.currentSchool$
			.pipe(
				filter((s) => !!s),
				mergeMap((s) => (!s.trial_end_date ? this.adminService.getRenewalData() : of(null))),
				filter((d) => !!d)
			)
			.subscribe({
				next: (data) => {
					this.expiring = data.renewal_status === 'expiring';
					this.showBox = true;
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
