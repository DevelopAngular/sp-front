import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {QuickPass} from '../models';
import {DataService} from '../data-service';
import {HttpService} from '../http-service';
import {JSONSerializer} from '../models';
import {Observable} from 'rxjs/Observable'
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
@Component({
  selector: 'app-quickpass-picker',
  templateUrl: './quickpass-picker.component.html',
  styleUrls: ['./quickpass-picker.component.css']
})

export class QuickpassPickerComponent implements OnInit {

  @Output() quickPassEvent: EventEmitter<QuickPass> = new EventEmitter();

  public selectedQuickpass:QuickPass;

  public quickpasses:Promise<QuickPass[]>;
  public dataSource;
  public barer;

  constructor(private dataService:DataService, private http:HttpService, private serializer:JSONSerializer) {}

  ngOnInit() {
    this.dataService.barerService.subscribe(barer => this.barer = barer);
    const config = {headers: {'Authorization': 'Bearer ' + this.barer}};
    this.quickpasses = this.http.get<QuickPass[]>('api/methacton/v1/template_passes', config).toPromise();
    // this.exampleDatabase = new ExampleHttpDao(this.http, this.dataService);
    // this.updateDestinations();
  }

  validate(){
    return this.selectedQuickpass instanceof QuickPass;
  }

  getIcon(){
    return this.validate() ? 'fa-check' : 'fa-close';
  }

  updateQuickPass(event){
    this.quickPassEvent.emit(this.selectedQuickpass);
  }

  clearSelection(){
    console.log("boye");
    if(!!!this.selectedQuickpass){
      return;
    } else{
      this.selectedQuickpass = null;
    }
    this.updateQuickPass(null);
  }
}