import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource, MatIconRegistry, MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
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
import {PassFilterComponent} from '../pass-filter/pass-filter.component';
import {PassInfoComponent} from '../pass-info/pass-info.component';
import {Pass} from '../models';

@Component({
  selector: 'app-pass-table',
  templateUrl: './pass-table.component.html',
  styleUrls: ['./pass-table.component.css']
})
export class PassTableComponent{
  displayedColumns = ['student', 'to', 'from', 'timeOut', 'duration', 'info'];
  dataSource: MatTableDataSource<Pass> = new MatTableDataSource();;
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
 
  constructor(private http: HttpService, private dataService: DataService, public dialog: MatDialog, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('info', sanitizer.bypassSecurityTrustResourceUrl('assets/info.svg'));
  }

  openDialog(id): void {
    let dialogRef = this.dialog.open(PassInfoComponent, {
      width: '500px', height: '600px', data: {'id':id, 'barer': this.barer}
      
    });
    console.log("The dialog was opened with id: " +id);
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  ngOnInit(){
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.exampleDatabase = new ExampleHttpDao(this.http, this.dataService);
    this.updateTable();
  }

  info(id){
    console.log("Displaying information for pass: " +id);
    this.openDialog(id);
  }

  updateTable(){
    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.exampleDatabase!.getPasses(this.batchSize);
      }),
      map(data => {
        // Flip flag to show that loading has finished.
        let results = data['results'];
        let out:Pass[] = [];
        for(var i = 0; i<results.length;i++){
          let id = results[i]['id'];
          let name = results[i]['student']['display_name'];
          let toLocation = results[i]['to_location']['name'] +" (" +results[i]['to_location']['room'] +")";
          let fromLocation = results[i]['from_location']['name'] +" (" +results[i]['from_location']['room'] +")";
          
          let end = +new Date(results[i]['expiry_time']);
          let start = +new Date(results[i]['created']);
          let duration:any = Math.abs(end-start)/1000/60;

          let s = new Date(results[i]['created']);
          let hours = s.getHours();
          let mins = s.getMinutes();
          let day = s.getDate();
          let month = s.getMonth();
          let year = s.getFullYear();
          let time = s.toLocaleTimeString();
          let startTimeString = time.substring(0, time.indexOf(":", time.indexOf(":")+1)) +time.substring(time.length-3) +" - " +s.toLocaleDateString();
          let description = results[i]['description'];
          let authorities = results[i]['authorities'];
          out.push(new Pass(id,
                                name,
                                null,
                                null,
                                duration,
                                startTimeString,
                                description, 
                                authorities,
                                null,
                                null,
                                null));
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
      //console.log(this.dataSource.data);
      console.log("Page Index: " +this.pageIndex +" Length: " +this.length +" Page Size: " +this.pageSize);
      console.log(this.pageSize +" * " +(this.pageIndex+1) +" >= " +this.length);
      if(this.pageSize * (this.pageIndex+1) >= this.length){
        console.log("Getting more passes.\n----------------------");
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
    console.log("Sort: " +this.sort);
    console.log("Paginator: " +this.paginator);
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  onPaginateChange(event){
    this.pageIndex = event.pageIndex;
  }
}

export interface PassResponse{
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
    let config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
    let data = this.http.get<PassResponse>('api/methacton/v1/hall_passes?limit=' +batchSize, config);
    //console.log("Data:");
    //console.log(data);
    return data;
  }
}