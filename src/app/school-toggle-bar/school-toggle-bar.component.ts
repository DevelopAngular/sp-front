import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {School} from '../models/School';
import {HttpService} from '../services/http-service';
import {StorageService} from '../services/storage.service';

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
    private http: HttpService,
  ) { }

  ngOnInit() {
    this.http.currentSchool$.subscribe(school => {
      this.currentSchool = school;
    });
  }

  showOptions(target: HTMLElement) {
      // const target = new ElementRef(evt.currentTarget);
    console.log('========>', target);
    const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'alignSelf': true,
          'schools': this.schools,
          'selectedSchool': this.currentSchool,
          'trigger': target
        }
      });
      optionDialog.afterClosed().subscribe(data => {
        if (data) {
          this.http.setSchool(data);
        }
      });
    }
}
