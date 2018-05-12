import { Component, OnInit, Input } from '@angular/core';
import {Pinnable, Location} from '../NewModels';

@Component({
  selector: 'app-pinnable-selector',
  templateUrl: './pinnable-selector.component.html',
  styleUrls: ['./pinnable-selector.component.css']
})
export class PinnableSelectorComponent implements OnInit {

  @Input()
  target:string;

  pinnables: Pinnable[] = [];

  constructor() { }

  ngOnInit() {
    let lockerRoom: Location = new Location("1", "Locker Room", "MHS", "IDK", "IDK", "", "", true, [], [], [], 10, true);

    this.pinnables.push(new Pinnable("1", "Classrooms", "#F52B4F,#F37426", "../../assets/icons8-mortarboard_filled.png", "catagory", lockerRoom, "rooms"));
    
    this.pinnables.push(new Pinnable("2", "Locker", "#54ff00,#39ad00", "../../assets/icons8-lock_filled.png", "location", null, null));
  }

}
