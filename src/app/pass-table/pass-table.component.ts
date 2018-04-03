import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatIconRegistry, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {DataService} from '../data-service';
import {HttpService} from '../http-service';
import {DomSanitizer} from '@angular/platform-browser';
import {PassInfoComponent} from '../pass-info/pass-info.component';
import {JSONSerializer, Pass} from '../models';

@Component({
  selector: 'app-pass-table',
  templateUrl: './pass-table.component.html',
  styleUrls: ['./pass-table.component.css']
})
export class PassTableComponent implements OnInit, AfterViewInit {
  displayedColumns = ['student', 'to', 'from', 'timeOut', 'duration', 'info'];
  dataSource: MatTableDataSource<Pass> = new MatTableDataSource();

  exampleDatabase: ExampleHttpDao;
  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 100];
  barer;
  batchSize = 50;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpService, private dataService: DataService, private serializer: JSONSerializer,
              public dialog: MatDialog, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('info', sanitizer.bypassSecurityTrustResourceUrl('assets/info.svg'));
  }

  openDialog(id): void {
    const dialogRef = this.dialog.open(PassInfoComponent, {
      width: '500px', height: '600px', data: {'id': id, 'barer': this.barer}

    });
    console.log('The dialog was opened with id: ' + id);
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.exampleDatabase = new ExampleHttpDao(this.http, this.dataService);
    this.updateTable();
  }

  info(id) {
    console.log('Displaying information for pass: ' + id);
    this.openDialog(id);
  }

  updateTable() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase.getPasses(this.batchSize);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          const results = data['results'];
          const out: Pass[] = [];
          for (let i = 0; i < results.length; i++) {

            out.push(this.serializer.getPassFromJSON(results[i]));

            // const id = results[i]['id'];
            // const name = results[i]['student']['display_name'];
            // const toLocation = results[i]['to_location']['name'] + ' (' + results[i]['to_location']['room'] + ')';
            // const fromLocation = results[i]['from_location']['name'] + ' (' + results[i]['from_location']['room'] + ')';
            //
            // const end = +new Date(results[i]['expiry_time']);
            // const start = +new Date(results[i]['created']);
            // const duration: any = Math.abs(end - start) / 1000 / 60;
            //
            // const s = new Date(results[i]['created']);
            // const hours = s.getHours();
            // const mins = s.getMinutes();
            // const day = s.getDate();
            // const month = s.getMonth();
            // const year = s.getFullYear();
            // const time = s.toLocaleTimeString();
            // const startTimeString = time.substring(0, time.indexOf(':', time.indexOf(':') + 1)) +
            //   time.substring(time.length - 3) + ' - ' + s.toLocaleDateString();
            // const description = results[i]['description'];
            // const authorities = results[i]['authorities'];
            // out.push(new Pass(id,
            //   name,
            //   null,
            //   null,
            //   duration,
            //   startTimeString,
            //   description,
            //   authorities,
            //   null,
            //   null,
            //   null));
          }
          // for(var i = 0; i<out.length;i++){
          //   console.log(out[i]);
          // }

          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.length = out.length;

          return out;
        }),
        catchError(error => {
          console.log(error);
          this.isLoadingResults = false;
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => {
      this.dataSource.data = data;
      // console.log(this.dataSource.data);
      console.log('Page Index: ' + this.pageIndex + ' Length: ' + this.length + ' Page Size: ' + this.pageSize);
      console.log(this.pageSize + ' * ' + (this.pageIndex + 1) + ' >= ' + this.length);
      if (this.pageSize * (this.pageIndex + 1) >= this.length) {
        console.log('Getting more passes.\n----------------------');
        this.batchSize += this.pageSize;
        this.updateTable();
      }
    });
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    console.log('Sort: ' + this.sort);
    console.log('Paginator: ' + this.paginator);
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  onPaginateChange(event) {
    this.pageIndex = event.pageIndex;
  }
}

export interface PassResponse {
  results: any[];
  next: any;
  prev: any[];
}

export class ExampleHttpDao {
  constructor(private http: HttpService, private dataService: DataService) {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
  }

  barer;

  getPasses(batchSize): Observable<PassResponse> {
    const config = {headers: {'Authorization': 'Bearer ' + this.barer}};
    const data = this.http.get<PassResponse>('api/methacton/v1/hall_passes?limit=' + batchSize, config);
    // console.log("Data:");
    // console.log(data);
    return data;
  }
}
