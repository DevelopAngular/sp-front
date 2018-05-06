import {Component, ElementRef, Input, NgZone, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {DataService} from '../data-service';
import {HttpService} from '../http-service';
import {UserService} from '../user.service';
import {Pinnable, Location} from '../NewModels';

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.css']
})

export class GoogleSigninComponent {

  @Input()
  page: string;

  public name = 'Not Logged in!';

  public isLoaded = false;
  public progressValue = 0;
  public progressType = 'determinate';

  public content: any = '';
  public user: any = '';
  public profile: any = '';

  public testPinnable1: Pinnable;
  public testPinnable2: Pinnable;

  @ViewChild('signInButton') signInButton;
  @ViewChild('signOutButton') signOutButton;

  constructor(private element: ElementRef, private http: HttpService,
              private router: Router, private _ngZone: NgZone,
              private dataService: DataService,
              private userService: UserService) {

                let lockerRoom: Location = new Location("1", "Locker Room", "MHS", "IDK", "IDK", "", "", true, [], [], [], 10, true);

    this.testPinnable1 = new Pinnable("1", "Classrooms", "#F52B4F,#F37426", "../../assets/icons8-mortarboard_filled.png", "catagory", lockerRoom, "rooms");
    
    this.testPinnable2 = new Pinnable("2", "Locker", "#54ff00,#39ad00", "../../assets/icons8-lock_filled.png", "location", null, null);

    let intervalId: any;

    this.userService.isAuthLoaded().subscribe(isLoaded => {
      this._ngZone.run(() => {
        //console.log('isLoaded:', isLoaded);
        this.isLoaded = isLoaded;

        if (isLoaded && intervalId !== undefined) {
          clearInterval(intervalId);
          intervalId = undefined;
        } else if (!this.isLoaded && intervalId === undefined) {
          let counter = 0;
          intervalId = setInterval(() => {

            this.progressValue = 98 * (1 - Math.pow(1.2, -counter));
            counter += 0.5;
          }, 50);
        }

      });
    });

    this.userService.userData.subscribe(user => {
      this.dataService.currentBarer.subscribe((barer)=>{
        if(!!barer){
          this.router.navigate(['/main']);
        }
      });
    });
  }

  initLogin() {
    this.userService.signIn()
      .catch(e => console.error(e));
  }

  pinnableSelected(event){
    console.log(event);
  }
}
