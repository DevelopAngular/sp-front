import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rooms-set-up',
  templateUrl: './rooms-set-up.component.html',
  styleUrls: ['./rooms-set-up.component.scss']
})
export class RoomsSetUpComponent implements OnInit {

  mockPinnables;

  constructor() { }

  ngOnInit() {
    this.mockPinnables = [
        {
          title: 'Bathroom',
          icon: '',
          gradient: '#5C4AE3,#336DE4',
        },
        {
          title: 'Water Fountain',
          icon: '',
          gradient: '#1893E9,#05B5DE'
        },
        {
          title: 'Nurse',
          icon: '',
          gradient: '#DA2370,#FB434A'
        },
        {
          title: 'Guidance',
          icon: '',
          gradient: '#E38314,#EAB219'
        },
        {
            title: 'Main Office',
            icon: '',
            gradient: '#F52B4F,#F37426'
        },
        {
            title: 'Library',
            icon: '',
            gradient: '#13BF9E,#00D99B'
        }
    ];
  }
}
