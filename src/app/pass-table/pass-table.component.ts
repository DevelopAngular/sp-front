import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {DataService} from '../data-service';
import {HttpService} from '../http-service';

@Component({
  selector: 'app-pass-table',
  templateUrl: './pass-table.component.html',
  styleUrls: ['./pass-table.component.css']
})
export class PassTableComponent{
  displayedColumns = ['name', 'to', 'from', 'timeIn'];
  dataSource: MatTableDataSource<PassData>;
  exampleDatabase: ExampleHttpDao | null;
  length = 100;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  barer;
  nextBatch;
  prevBatch;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpService, private dataService: DataService) {
    
  }

  // getPasses(){
  //   var out:PassData[] = [];
  //   console.log(this.barer);
  //   var config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
  //   this.http.get('api/methacton/v1/hall_passes?limit=' +this.pageSize, config).subscribe((data:any) => {
  //     console.log("All Passes Data: ");
  //     console.log(data['results']);
  //     var results = data['results'];
  //     this.nextBatch = data['next'];
  //     this.prevBatch = data['prev'];

  //     for(var i = 0; i< results.length;i++){
  //       //out.push(new PassData(/*ADD PARAMETERS*/));
  //     }
  //   });
  //   return out;
  // }

  ngOnInit(){
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.exampleDatabase!.getPasses(this.pageSize);
      }),
      map(data => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.isRateLimitReached = false;
        this.resultsLength = data.results.length;

        return data.results;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        // Catch if the GitHub API has reached its rate limit. Return empty data.
        this.isRateLimitReached = true;
        return observableOf([]);
      })
    ).subscribe(data => this.dataSource.data = data);
  }
  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}


export interface PassResponse{
  results: any[];
  next: any;
  prev: any[];
}
export class PassData {
  constructor(name: string, to: string, from: string, timeIn: string, timeOut: string, description: string, email: string[]){

  }
}

export class ExampleHttpDao {
  constructor(private http: HttpService, private dataService: DataService) {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
  }
  barer;
  getPasses(pageSize): Observable<PassResponse> {
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
    return this.http.get<PassResponse>('api/methacton/v1/hall_passes?limit=' +pageSize, config);
  }
}