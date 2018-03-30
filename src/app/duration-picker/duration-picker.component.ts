import { Component, OnInit} from '@angular/core';

export class Duration{
  constructor(public display:string, public value:number){}
}

@Component({
  selector: 'app-duration-picker',
  templateUrl: './duration-picker.component.html',
  styleUrls: ['./duration-picker.component.css']
})

export class DurationPickerComponent implements OnInit {
  durations: Duration[] = [
                          new Duration("3 minutes", 3000),
                          new Duration("5 minutes", 5000),
                          new Duration("10 minutes", 10000),
                          new Duration("15 minutes", 15000),
                          new Duration("30 minutes", 30000)
                        ];
  public selectedDuration: Duration;
  constructor() { }

  ngOnInit() {
  }

}
