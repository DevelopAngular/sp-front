import { Component, OnInit, NgZone } from '@angular/core';
import { LoadingService } from '../loading.service';
import { DataService } from '../data-service';
import { User } from '../models/User';
import { Router } from '../../../node_modules/@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements OnInit {

  user: User;
  isStaff: boolean;
  slideIndex: number = 1;

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService, private router: Router) { }

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

  endIntro(){
    this.router.navigate(['/passes']);
  }

}
