import { Component, OnInit } from '@angular/core';
import {QuickPass} from '../models';
import {DataService} from '../data-service';
import {HttpService} from '../http-service';
import {JSONSerializer} from '../models';
@Component({
  selector: 'app-quickpass-picker',
  templateUrl: './quickpass-picker.component.html',
  styleUrls: ['./quickpass-picker.component.css']
})

export class QuickpassPickerComponent implements OnInit {
  public selectedQuickpass:QuickPass;
  public quickpasses:QuickPass[] = [];
  public barer;
  constructor(private dataService:DataService, private http:HttpService, private serializer:JSONSerializer) {
    dataService.barerService.subscribe(barer => this.barer = barer);
    this.setUpQuickPasses();
  }

  ngOnInit() {
    
  }

  validate(){
    return this.selectedQuickpass instanceof QuickPass;
  }

  getIcon(){
    return this.validate() ? 'fa-check' : 'fa-close';
  }

  async setUpQuickPasses(){
    this.quickpasses.push(new QuickPass(null, null, null, "Testing", null, null, null, null));
    console.log("Added test QP");
    const data = await this.getQuickPasses();
    console.log(data);
  }

  async getQuickPasses(){
    const config = {headers: {'Authorization': 'Bearer ' + this.barer}};
    const data = await this.http.get('api/methacton/v1/template_passes', config).toPromise();
    return data;
  }

}
