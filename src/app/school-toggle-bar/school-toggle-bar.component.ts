import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {School} from '../models/School';
import {HttpService} from '../services/http-service';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {NavbarDataService} from '../main/navbar-data.service';
import {NavbarElementsRefsService} from '../services/navbar-elements-refs.service';
import {CheckForUpdateService} from '../services/check-for-update.service';

@Component({
  selector: 'app-school-toggle-bar',
  templateUrl: './school-toggle-bar.component.html',
  styleUrls: ['./school-toggle-bar.component.scss']
})
export class SchoolToggleBarComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('schoolToggle', { static: true }) schoolToggle: ElementRef;

  @Input() schools: School[];

  public currentSchool: School;

  private subscriber$ = new Subject();

  isUpdateBar$: Subject<any>;

  constructor(
    private dialog: MatDialog,
    private http: HttpService,
    private navbarService: NavbarDataService,
    private navbarElementsService: NavbarElementsRefsService,
    private updateService: CheckForUpdateService
  ) { }

  ngOnInit() {
    this.isUpdateBar$ = this.updateService.needToUpdate$;
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

  ngAfterViewInit(): void {
    this.navbarElementsService.schoolToggle$.next(this.schoolToggle);
  }

  showOptions(target: HTMLElement) {
    UNANIMATED_CONTAINER.next(true);
    const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'alignSelf': true,
          'schools': this.schools,
          'selectedSchool': this.currentSchool,
          'heading': 'SELECT SCHOOL',
          'trigger': target,
          'isSearchField': this.schools.length >= 5
        }
      });
      optionDialog.afterClosed().subscribe(data => {
        UNANIMATED_CONTAINER.next(false);
        if (data) {
          this.http.schoolToggle$.next(data);
          this.http.setSchool(data);
        }
      });
    }
}
