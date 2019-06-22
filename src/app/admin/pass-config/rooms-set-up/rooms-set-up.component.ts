import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { bumpIn } from '../../../animations';

@Component({
  selector: 'app-rooms-set-up',
  templateUrl: './rooms-set-up.component.html',
  styleUrls: ['./rooms-set-up.component.scss'],
  animations: [bumpIn]
})
export class RoomsSetUpComponent implements OnInit {

  @Output() setUpResult: EventEmitter<any> = new EventEmitter<any>();

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
          color_profile_id: 12,
          room: 'BR',
          restricted: false,
          scheduling_restricted: false,
          max_allowed_time: 15,
          travel_types: ['one_way']
        },
        {
          title: 'Water Fountain',
          icon: 'https://png.icons8.com/ios-glyphs/drinking_fountain/FFFFFF/50',
          gradient: '#1893E9,#05B5DE',
          color_profile_id: 8,
          room: 'WF',
          restricted: false,
          scheduling_restricted: false,
          max_allowed_time: 3,
          travel_types: ['one_way']
        },
        {
          title: 'Nurse',
          icon: 'https://png.icons8.com/ios-glyphs/nurse_female/FFFFFF/50',
          gradient: '#D22C9F,#F46095',
          color_profile_id: 14,
          room: '101',
          restricted: false,
          scheduling_restricted: true,
          max_allowed_time: 10,
          travel_types: ['one_way']
        },
        {
          title: 'Guidance',
          icon: 'https://png.icons8.com/ios-glyphs/counselor/FFFFFF/50',
          gradient: '#E38314,#EAB219',
          color_profile_id: 3,
          room: '102',
          restricted: false,
          scheduling_restricted: true,
          max_allowed_time: 10,
          travel_types: ['one_way']
        },
        {
            title: 'Main Office',
            icon: 'https://img.icons8.com/ios-glyphs/50/FFFFFF/front-desk.png',
            gradient: '#F52B4F,#F37426',
            color_profile_id: 2,
            room: '103',
            restricted: false,
            scheduling_restricted: true,
            max_allowed_time: 10,
            travel_types: ['one_way', 'round_trip']
        },
        {
            title: 'Library',
            icon: 'https://png.icons8.com/ios-glyphs/library/FFFFFF/50',
            gradient: '#13BF9E,#00D99B',
            color_profile_id: 7,
            room: '104',
            restricted: true,
            scheduling_restricted: true,
            max_allowed_time: 15,
            travel_types: ['one_way', 'round_trip']
        }
    ];
  }

  onClick(createPack: boolean) {
      this.setUpResult.emit({createPack, pinnables: this.mockPinnables});
  }

  onPress(press: boolean, action: string) {
      if (action === 'scratch') {
          this.buttonDownScratch = press;
      } else if (action === 'pack') {
          this.buttonDownPack = press;
      }
  }
}