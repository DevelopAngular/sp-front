import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import { User } from '../models/User';
import { bumpIn } from '../animations';
import {PassLike} from '../models';
import {HallPass} from '../models/HallPass';
import {Subject} from 'rxjs';
import {StorageService} from '../services/storage.service';

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

  constructor(
      public dataService: DataService,
      private _zone: NgZone,
      private loadingService: LoadingService,
      private router: Router,
      private storage: StorageService
  ) {
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

          this.slides = {
            '#1': [
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Tomorrow, 9:03 AM',
                arrows: 'one'
              },
              {
                header: 'Gardner',
                gradient: '#F52B4F,#F37426',
                content: 'Sept 29, 11:35 AM',
                arrows: 'one'
              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two'
              },
            ],
            '#2': [
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Tomorrow, 9:03 AM',
                arrows: 'one',
                footer: 'H.Keller'
              },
              {
                header: 'Gardner',
                gradient: '#F52B4F,#F37426',
                content: 'Monday, 11:35 AM',
                arrows: 'one',
                footer: 'H.Keller'
              },
              {
                header: 'Piaget',
                gradient: '#F52B4F,#F37426',
                content: 'Sept 29, 10:14 AM',
                arrows: 'one',
                footer: 'H.Keller'
              },
            ],
            '#3': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two'

              },
              {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'Yesterday, 2:15 PM',
                arrows: 'two'


              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Tuesday, 9:32 AM',
                arrows: 'two'

              },
              {
                header: 'Water Fountain',
                gradient: '  #1893E9,#05B5DE',
                content: 'Tuesday, 12:41 PM',
                arrows: 'two'
              },
            ],
            '#3.1': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two',
                footer: 'H.Keller'

              },
              {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'Yesterday, 2:15 PM',
                arrows: 'two',
                footer: 'H.Keller'

              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Tuesday, 9:32 AM',
                arrows: 'two',
                footer: 'H.Keller'

              }
            ],
            '#3.2': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Today, 8:35 AM',
                arrows: 'two',
                footer: 'B. Washington',
                icon: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png',


              },
              {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'Yesterday, 2:15 PM',
                arrows: 'two',
                badge: true,
                footer: 'J.Locke',
                icon: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png',

              },
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'Tuesday, 9:32 AM',
                arrows: 'two',
                footer: 'H.Keller',
                icon: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png'

              }
            ],
            '#4': [
              {
                header: 'Bathroom',
                gradient: '#5C4AE3,#336DE4',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Bathroom%20(White).png'
              },        {
                header: 'Water Fountain',
                gradient: '#1893E9,#05B5DE',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Water%20Fountain%20(White).png'
              },        {
                header: 'Classrooms',
                gradient: '#F52B4F,#F37426',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Classroom%20(White).png',
                arrow: true
              },        {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Counselor%20(White).png',
                restricted: true
              },        {
                header: 'MainOffice',
                gradient: '#5DBB21,#78D118',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Office%20(White).png'
              },        {
                header: 'Library',
                gradient: '#0B9FC1,#00C0C7',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Library%20(White).png',
                restricted: true
              },        {
                header: 'Early Dismissal',
                gradient: '#13BF9E,#00D99B',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Bell%20(White).png',
                restricted: true
              },        {
                header: 'Nurse',
                gradient: '#DA2370,#FB434A',
                content: 'https://storage.googleapis.com/courier-static/release-icons/Nurse%20(White).png'
              },
            ],
            '#5': [
              {
                header: 'Library',
                gradient: '#0B9FC1,#00C0C7',
                content: 'Tomorrow, 9:41 AM',
                arrows: 'two'
              },
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Denied',
                arrows: 'two',
                badge: true
              },
              {
                header: 'Counselor',
                gradient: '#E38314,#EAB219',
                content: 'Monday, 8:15 AM',
                arrows: 'one'
              }
            ],
            '#6': [
              {
                header: 'Early Dismissal',
                gradient: '#13BF9E,#00D99B',
                content: 'Today, 12:05 PM',
                arrows: 'one',
                badge: true
              },
              {
                header: 'Clark',
                gradient: '#F52B4F,#F37426',
                content: 'Monday, 8:57 AM',
                arrows: 'one',
              }
            ],
            '#6.1': [
              {
                header: 'Library',
                gradient: '#0B9FC1,#00C0C7',
                content: 'Tomorrow, 9:41 AM',
                arrows: 'one',
                badge: true
              },
              {
                header: 'Clark',
                gradient: '#F52B4F,#F37426',
                content: 'Monday, 8:57 AM',
                arrows: 'one',
              }
            ],
          };
        });
      });
      // this.endIntro();
  }

  endIntro() {

    if (this.isStaff) {
      this.storage.setItem('smartpass_intro_teacher', 'seen');
    } else {
      this.storage.setItem('smartpass_intro_student', 'seen');
    }
    this.router.navigate(['select-profile']);
  }

  onPress(press: boolean, id: string) {
    this.buttons[id] = press;
  }

  getButtonState(id: string) {
    return (this.buttons[id] ? 'down' : 'up');
  }

}
