import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '../NewModels';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-location-cell',
  templateUrl: './location-cell.component.html',
  styleUrls: ['./location-cell.component.scss']
})
export class LocationCellComponent implements OnInit {

  @Input()
  value: Location;

  @Input()
  type: string;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<any> = new EventEmitter();

  overStar: boolean = false;

  constructor(private http: HttpService) {}

  ngOnInit() {}

  cellSelected() {
    if(!this.overStar)
      this.onSelect.emit(this.value);
  }

  favorite(){
    this.value.starred = !this.value.starred;
    let endpoint = 'api/methacton/v1/locations/' +this.value.id +'/starred';
    if(this.value.starred){
      console.log('STARRING');
      this.http.put(endpoint).subscribe(data=>this.onStar.emit());
    } else{
      this.http.delete(endpoint).subscribe(data=>this.onStar.emit());
    }
  }

}
