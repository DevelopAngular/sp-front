import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User';
import { concatMap } from 'rxjs/operators';
import { DarkThemeSwitch } from '../../dark-theme-switch';

@Component({
	selector: 'sp-referral-page',
	templateUrl: './referral-page.component.html',
	styleUrls: ['./referral-page.component.scss'],
})
export class ReferralPageComponent implements OnInit {
	user: User;
	constructor(private userService: UserService, public darkTheme: DarkThemeSwitch) {}

	ngOnInit(): void {
		this.userService.userData.pipe(concatMap((user) => this.userService.getUserById(user.id))).subscribe((user) => {
			this.user = User.fromJSON(user);
		});
	}
}
