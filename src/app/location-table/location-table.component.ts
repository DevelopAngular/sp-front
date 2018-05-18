import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HttpService } from '../http-service';
import { Location } from '../NewModels';

@Component({
  selector: 'app-location-table',
  templateUrl: './location-table.component.html',
  styleUrls: ['./location-table.component.css']
})
export class LocationTableComponent implements OnInit {

  category:string;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  @Input()
  set setCategory(c:string){
    this.category = c;
    console.log(c);
  }

  public locations:Promise<Location[]>;

  constructor(private http:HttpService) { }

  ngOnInit() {
    this.locations = this.http.get<Location[]>('api/methacton/v1/locations?category=' +this.category).toPromise();
  }

  updateCategory(category:string){
    this.category = category;
    this.locations = this.http.get<Location[]>('api/methacton/v1/locations?category=' +this.category).toPromise();
  }

}
