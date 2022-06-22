import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DarkThemeSwitch } from '../../dark-theme-switch';

@Component({
  selector: 'app-id-cards',
  templateUrl: './id-cards.component.html',
  styleUrls: ['./id-cards.component.scss']
})
export class IdCardsComponent {

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
  ) { }

  getStarted(){
    this.router.navigate(['admin/idcards/editor'])
  }

}
