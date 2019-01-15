import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {School} from '../models/School';
import {HttpService} from '../http-service';

@Component({
  selector: 'app-school-toggle-bar',
  templateUrl: './school-toggle-bar.component.html',
  styleUrls: ['./school-toggle-bar.component.scss']
})
export class SchoolToggleBarComponent implements OnInit {

  @Input() schools: School[];

  public currentSchool: School;

  constructor(
    private dialog: MatDialog,
    private http: HttpService
  ) { }

  ngOnInit() {
    this.currentSchool = this.schools[0];
    this.http.schoolIdSubject.next(this.currentSchool);
  }
  showOptions(evt: MouseEvent) {
      const target = new ElementRef(evt.currentTarget);
      const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'schools': this.schools,
          'selectedSchool': this.currentSchool,
          'trigger': target
        }
      });
      optionDialog.afterClosed().subscribe(data => {
        this.currentSchool = data ? data : this.currentSchool;
        this.http.schoolIdSubject.next(this.currentSchool);
      });
    }
}
