import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AdminService} from '../../../services/admin.service';
import {UserService} from '../../../services/user.service';

declare const window;

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  @Input() onboardProcess: any;

  cards = [
    {
      title: 'Create your rooms',
      subtitle: 'Add rooms with lots of customized options.',
      buttonText: 'Set up rooms',
      buttonIcon: './assets/Room (White).svg',
      url: 'admin/passconfig',
      onboardName: '2.landing:first_room'
    },
    {
      title: 'Add your accounts',
      subtitle: 'Quickly add an account to see how it works.',
      buttonText: 'Add accounts',
      buttonIcon: './assets/Users (White).svg',
      url: 'admin/accounts',
      onboardName: '2.landing:first_account'
    },
    {
      title: 'Need some help?',
      subtitle: 'Support guides, live chat, or free support calls.',
      buttonText: 'Open support',
      buttonIcon: './assets/Support (White).svg',
      onboardName: '2.landing:support_dismiss'
    }
  ];


  constructor(
    private router: Router,
    private adminService: AdminService,
    private userService: UserService
    ) { }

  ngOnInit() {

  }

  redirectTo(card) {
    if (card.url) {
      this.router.navigate([card.url]);
    } else {
      this.userService.openSupportTrigger$.next();
      this.removeCard(card);
    }
  }

  removeCard(card) {
    this.adminService.updateOnboardProgressRequest(card.onboardName);
    this.cards = this.cards.filter(c => card.title !== c.title);
  }

}
