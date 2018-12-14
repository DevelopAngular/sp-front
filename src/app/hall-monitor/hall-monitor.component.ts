import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { merge } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { DataService } from '../data-service';
import { mergeObject } from '../live-data/helpers';
import { LiveDataService } from '../live-data/live-data.service';
import { LoadingService } from '../loading.service';
import { PassLikeProvider } from '../models/providers';
import { User } from '../models/User';
import { ReportFormComponent } from '../report-form/report-form.component';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

export class ActivePassProvider implements PassLikeProvider {

  constructor(private liveDataService: LiveDataService, private searchQueries: Observable<string>) {
  }

  watch(sort: Observable<string>) {

    const sort$ = sort.map(s => ({sort: s}));
    const search$ = this.searchQueries.map(s => ({search_query: s}));

    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$, search$));

    return this.liveDataService.watchActiveHallPasses(merged$);
  }
}

@Component({
  selector: 'app-hall-monitor',
  templateUrl: './hall-monitor.component.html',
  styleUrls: ['./hall-monitor.component.scss']
})
export class HallMonitorComponent implements OnInit {

  activePassProvider: PassLikeProvider;

  inputValue = '';

  user: User;
  isStaff = false;
  canView = false;

  searchQuery$ = new BehaviorSubject('');

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService,
              public dialog: MatDialog, private liveDataService: LiveDataService) {
    this.activePassProvider = new ActivePassProvider(this.liveDataService, this.searchQuery$);
    // this.activePassProvider = new BasicPassLikeProvider(testPasses);
  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.map(isUserStaff);
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
          this.canView = user.roles.includes('view_traveling_users');
        });
      });
  }

  openReportForm() {
    const dialogRef = this.dialog.open(ReportFormComponent, {
      width: '750px',
      height: '365px',
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
    });
  }

  onSearch(search: string) {
    console.log('Here it emits!');
    this.searchQuery$.next(search);
  }

}
