import {Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {School} from '../models/School';
import {HttpService} from '../services/http-service';
import {StorageService} from '../services/storage.service';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';

@Component({
  selector: 'app-school-toggle-bar',
  templateUrl: './school-toggle-bar.component.html',
  styleUrls: ['./school-toggle-bar.component.scss']
})
export class SchoolToggleBarComponent implements OnInit, OnDestroy {

  @Input() schools: School[];

  public currentSchool: School;

  private subscriber$ = new Subject();

  constructor(
    private dialog: MatDialog,
    private http: HttpService,
  ) { }

  ngOnInit() {
    this.schools = this.schools.sort( (school, schoolToCompare) => {
        return school.name.localeCompare(schoolToCompare.name);
    });

    this.http.currentSchool$.pipe(takeUntil(this.subscriber$), filter(res => !!res)).subscribe(school => {
      this.currentSchool = school;
    });
  }

  ngOnDestroy() {
    this.subscriber$.next(null);
    this.subscriber$.complete();
  }

  showOptions(target: HTMLElement) {
      // const target = new ElementRef(evt.currentTarget);
    // console.log('========>', target);
    UNANIMATED_CONTAINER.next(true);
    const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'alignSelf': true,
          'schools': this.schools,
          'selectedSchool': this.currentSchool,
          'heading': 'SELECT SCHOOL',
          'trigger': target
        }
      });
      optionDialog.afterClosed().subscribe(data => {
        UNANIMATED_CONTAINER.next(false);
        if (data) {
          this.http.setSchool(data);
        }
      });
    }
}
