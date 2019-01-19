import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-teacher-footer',
  templateUrl: './teacher-footer.component.html',
  styleUrls: ['./teacher-footer.component.scss']
})
export class TeacherFooterComponent implements OnInit {

  @Input() date;

  @Input() students;

  @Input() currentState: string;

  @Input() fromLocation;

  @Input() toLocation;

  showFullFooter: boolean = false;

  text: {
    fromLocation: string,
    toLocation: string
  };

  constructor() { }

  get fromLocationText() {
    return this.fromLocation ? this.fromLocation.title : 'Origin';
  }

  get toLocationText() {
    return this.toLocation ? this.toLocation.title : 'Destination';
  }

  ngOnInit() {
    // this.getTextLocation();
  }

  getTextLocation() {
    if (!this.fromLocation && !this.toLocation) {
      return this.text = {
         fromLocation: 'Origin',
         toLocation: 'Destination'
      };
    }
    if (this.fromLocation && !this.toLocation) {
       return this.text = {
          fromLocation: this.fromLocation.title,
          toLocation: 'Destination'
       };
    }
    if (this.fromLocation && this.toLocation) {
       return this.text = {
          fromLocation: this.fromLocation.title,
          toLocation: this.toLocation.title
       };
    }
    }

}
