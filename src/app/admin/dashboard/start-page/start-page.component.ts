import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  cards = [
    {
      title: 'Create your rooms',
      subtitle: 'Add rooms with lots of customized options.',
      buttonText: 'Set up rooms',
      buttonIcon: './assets/Room (White).svg',
      url: 'admin/passconfig'
    },
    {
      title: 'Add your accounts',
      subtitle: 'Quickly add an account to see how it works.',
      buttonText: 'Add accounts',
      buttonIcon: './assets/Users (White).svg',
      url: 'admin/accounts'
    },
    {
      title: 'Need some help?',
      subtitle: 'Support guides, live chat, or free support calls.',
      buttonText: 'Open support',
      buttonIcon: './assets/Support (White).svg'
    }
  ];


  constructor(private router: Router) { }

  ngOnInit() {
  }

  redirectTo(card) {
    this.router.navigate([card.url]);
  }

  removeCard(card) {
    this.cards = this.cards.filter(c => card.title !== c.title);
  }

}
