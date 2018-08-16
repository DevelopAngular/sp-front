import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';
import { User } from '../models/User';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements OnInit {

  user: User;
  isStaff: boolean;
  slideIndex: number = 1;

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService, private router: Router) {
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
        });
      });
  }

  endIntro() {
    this.router.navigate(['main/passes']);
  }

}
