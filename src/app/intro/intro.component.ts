import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';
import { User } from '../models/User';
import { bumpIn } from '../animations';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
  animations: [
    bumpIn
  ]
})
export class IntroComponent implements OnInit {

  user: User;
  isStaff: boolean;
  slideIndex: number = 1;

  buttons = {'left': false, 'right': false};

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService, private router: Router) {
    console.log('intro.constructor');
  }

  ngOnInit() {
    console.log('intro.onInit()');
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        console.log('intro.subscribe()');
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('_profile_teacher');
        });
      });
  }

  endIntro() {
    localStorage.setItem('smartpass_intro', 'seen');
    this.router.navigate(['main/passes']);
  }

  onPress(press: boolean, id: string) {
    this.buttons[id] = press;
  }

  getButtonState(id: string) {
    return (this.buttons[id] ? 'down' : 'up');
  }

}
