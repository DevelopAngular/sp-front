import {Component, Input, OnInit} from '@angular/core';
import {LocationService} from '../location.service';
import {Navigation} from '../../hallpass-form.component';

@Component({
  selector: 'app-teacher-footer',
  templateUrl: './teacher-footer.component.html',
  styleUrls: ['./teacher-footer.component.scss']
})
export class TeacherFooterComponent implements OnInit {

  @Input() date;

  @Input() studentText;

  @Input() currentState: string;

  @Input() fromLocation;

  @Input() toLocation;

  @Input() state: string;

  @Input() formState: Navigation;

  showFullFooter: boolean = false;

  constructor(private locService: LocationService) { }

  get fromLocationText() {
    return this.fromLocation ? this.fromLocation.title : 'Origin';
  }

  get toLocationText() {
    return this.toLocation ? this.toLocation.title : 'Destination';
  }

  get fromCursor() {
     return this.state !== 'from' && !this.date;
  }

  get toCursor() {
    return this.state !== 'to' && this.state !== 'from';
  }

  ngOnInit() {
  }

  goToFromWhere() {
     if (this.state === 'from' || this.date) {
        return false;
     }
    this.locService.nextStep('from');
  }

  goToToWhere() {
     if (this.state === 'to' || this.state === 'from') {
       return false;
     }
    this.locService.nextStep('toWhere');
  }

  goToStudents() {

  }

  goToDate() {
    this.locService.changeLocation$.next('date');
  }

}
