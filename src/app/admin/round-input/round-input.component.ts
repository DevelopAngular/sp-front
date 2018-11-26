import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DateInputComponent } from '../date-input/date-input.component';
import { HallpassFormComponent } from '../../hallpass-form/hallpass-form.component';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.scss']
})
export class RoundInputComponent implements OnInit {

  @Input() labelText: string;
  @Input() placeholder: string;
  @Input() type: string; //Can be 'text', 'chips', or 'dates'
  @Input() completeService: any; //A function that determines how the input should search.
  @Input() hasTogglePicker: boolean;

  @Output() ontextupdate: EventEmitter<any> = new EventEmitter();
  @Output() ontoogleupdate: EventEmitter<any> = new EventEmitter();

  selected: boolean;
  value: any;
  toDate: Date;
  fromDate: Date;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {

  }

  focusAction(selected: boolean){
    this.selected = selected;
    if(selected && this.type == 'dates'){
      const dateDialog = this.dialog.open(DateInputComponent, {
        width: '750px',
        panelClass: 'form-dialog-container',
        backdropClass: 'custom-backdrop',
        data: {'to':this.toDate?this.toDate:new Date(), 'from':this.fromDate?this.fromDate:new Date()}
      });

      dateDialog.afterOpen().subscribe(()=>{this.selected = true;});

      dateDialog.afterClosed().subscribe(dates =>{
        if(dates){
          this.value = dates['text'];
          this.toDate = dates['to'];
          this.fromDate = dates['from'];
          this.ontextupdate.emit({'to':dates['to'], 'from': dates['from']});
        }
      });
    }
  }

  changeAction(change: any){
    if(this.type == 'text'){
      this.ontextupdate.emit(change)
    }
  }

}
