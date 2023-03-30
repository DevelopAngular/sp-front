import { Component, Input, OnInit } from '@angular/core';
import teamMembers from './member-data';

@Component({
	selector: 'app-team-member',
	templateUrl: './team-member.component.html',
	styleUrls: ['./team-member.component.scss'],
})
export class TeamMemberComponent implements OnInit {
	@Input() id: string;
	@Input() job: string;

	public picUrl: string;
	public name: string;
	public email: string;

	ngOnInit(): void {
		let teamMember = teamMembers[this.id];
		this.picUrl = './assets/team-profiles/' + teamMember.image_name;
		this.name = teamMember.name;
		this.email = teamMember.email;
	}
}
