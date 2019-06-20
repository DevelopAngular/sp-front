import { Component, OnInit } from '@angular/core';
import {bumpIn} from '../../../animations';

@Component({
  selector: 'app-rooms-set-up',
  templateUrl: './rooms-set-up.component.html',
  styleUrls: ['./rooms-set-up.component.scss'],
  animations: [bumpIn]
})
export class RoomsSetUpComponent implements OnInit {

  mockPinnables;

  buttonDownScratch: boolean;
  buttonDownPack: boolean;

  constructor() { }

  get buttonStatePack() {
     return this.buttonDownPack ? 'down' : 'up';
  }

  get buttonStateScratch() {
     return this.buttonDownScratch ? 'down' : 'up';
  }

  ngOnInit() {
    this.mockPinnables = [
        {
          title: 'Bathroom',
          icon: 'https://png.icons8.com/ios-glyphs/toilet/FFFFFF/50',
          gradient: '#5C4AE3,#336DE4',
        },
        {
          title: 'Water Fountain',
          icon: 'https://png.icons8.com/ios-glyphs/drinking_fountain/FFFFFF/50',
          gradient: '#1893E9,#05B5DE'
        },
        {
          title: 'Nurse',
          icon: 'https://png.icons8.com/ios-glyphs/nurse_female/FFFFFF/50',
          gradient: '#DA2370,#FB434A'
        },
        {
          title: 'Guidance',
          icon: 'https://png.icons8.com/ios-glyphs/counselor/FFFFFF/50',
          gradient: '#E38314,#EAB219'
        },
        {
            title: 'Main Office',
            icon: 'https://img.icons8.com/ios-glyphs/50/FFFFFF/front-desk.png',
            gradient: '#F52B4F,#F37426'
        },
        {
            title: 'Library',
            icon: 'https://png.icons8.com/ios-glyphs/library/FFFFFF/50',
            gradient: '#13BF9E,#00D99B'
        }
    ];
  }

  onPress(press: boolean, action: string) {
      if (action === 'scratch') {
          this.buttonDownScratch = press;
      } else if (action === 'pack') {
          this.buttonDownPack = press;
      }
  }
}
