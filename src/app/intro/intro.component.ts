import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';
import { User } from '../models/User';
import { bumpIn } from '../animations';
import {PassLike} from '../models';
import {HallPass} from '../models/HallPass';
import {Subject} from 'rxjs';

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
  slides;

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService, private router: Router) {
    console.log('intro.constructor');

    this.slides = {
      '#1': [
        {
          header: 'Counselor',
          gradient: '#E38314,#EAB219',
          content: 'Tomorrow, 9:03 AM'
        },
        {
          header: 'Gardner',
          gradient: '#F52B4F,#F37426',
          content: 'Sept 29, 11:35 AM'
        },
        {
          header: 'Bathroom',
          gradient: '#5C4AE3,#336DE4',
          content: 'Today, 8:35 AM'
        },
      ],
      '#2': [
        {
          header: 'Counselor',
          gradient: '#E38314,#EAB219',
          content: 'Tomorrow, 9:03 AM'
        },
        {
          header: 'Gardner',
          gradient: '#F52B4F,#F37426',
          content: 'Sept 29, 11:35 AM'
        },
        {
          header: 'Piaget',
          gradient: '#F52B4F,#F37426',
          content: 'Sept 29, 10:14 AM'
        },
      ],
      '#3': [
        {
          header: 'Bathroom',
          gradient: '#5C4AE3,#336DE4',
          content: 'Today, 8:35 AM'
        },
        {
          header: 'Nurse',
          gradient: '#DA2370,#FB434A',
          content: 'Yesterday, 2:15 PM'
        },
        {
          header: 'Bathroom',
          gradient: '#5C4AE3,#336DE4',
          content: 'Tuesday, 9:32 AM'
        },
        {
          header: 'Water Fountain',
          gradient: '  #1893E9,#05B5DE',
          content: 'Tuesday, 12:41 PM'
        },
      ],
      '#4': [
        {
          header: 'Bathroom',
          gradient: '#022F68,#2F66AB',
          content: 'https://storage.googleapis.com/courier-static/release-icons/Career%20(White).png'
        },
        // {
        //   header: 'Nurse',
        //   gradient: '#DA2370,#FB434A',
        //   content: 'Yesterday, 2:15 PM'
        // },
        // {
        //   header: 'Bathroom',
        //   gradient: '#5C4AE3,#336DE4',
        //   content: 'Tuesday, 9:32 AM'
        // },
        // {
        //   header: 'Water Fountain',
        //   gradient: '  #1893E9,#05B5DE',
        //   content: 'Tuesday, 12:41 PM'
        // },
      ]
    };
    // mockData = {
    //   headers: [
    //     'Counselor',
    //     'Gardner',
    //     'Bathroom'
    //   ],
    //   gradients: [
    //     '#E38314,#EAB219',
    //     '#F52B4F,#F37426',
    //     '#5C4AE3,#336DE4'
    //   ],
    //   dates: [
    //     'Tomorrow, 9:03 AM',
    //     'Sept 29, 11:35 AM',
    //     'Today, 8:35 AM'
    //   ]
    // };

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
      this.endIntro();
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
