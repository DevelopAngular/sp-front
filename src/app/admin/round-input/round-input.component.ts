import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { MatDialog } from '@angular/material';
import { DateInputComponent } from '../date-input/date-input.component';
import { Paged } from '../../location-table/location-table.component';
import { HttpService } from '../../http-service';
import { InputHelperDialogComponent } from '../input-helper-dialog/input-helper-dialog.component';
import {FormGroup} from '@angular/forms';
import {fromEvent, Observable} from 'rxjs';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.scss']
})
export class RoundInputComponent implements OnInit {

  @Input() labelText: string;
  @Input() placeholder: string;
  @Input() type: string;
  //Can be 'text', 'multilocation', 'multiuser', or 'dates'  There may be some places where multiuser may need to be split into student and teacher. I tried finding a better way to do this, but this is just short term.
  @Input() hasTogglePicker: boolean;
  @Input() width: string;
  @Input() minWidth: string;
  @Output() ontextupdate: EventEmitter<any> = new EventEmitter();
  @Output() ontoggleupdate: EventEmitter<any> = new EventEmitter();
  @Output() onselectionupdate: EventEmitter<any> = new EventEmitter();
  @Output() controlValue = new EventEmitter();
  selected: boolean;
  value: string;
  toDate: Date;
  fromDate: Date;
  searchOptions: Promise<any[]>;
  selections: any[] = [];
  chipListHeight: string = '40px';
  toggleState: string = 'Either';

  public e: Observable<Event>;

  constructor(public dialog: MatDialog, private http: HttpService) { }

  ngOnInit() {
  }

  focusAction(selected: boolean){
    this.selected = selected;
    if (selected && this.type == 'dates') {
      const dateDialog = this.dialog.open(InputHelperDialogComponent, {
        width: '900px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd',
        data: {'type':'dates', 'to':this.toDate?this.toDate:new Date(), 'from':this.fromDate?this.fromDate:new Date()}
      });
      // panelClass: 'accounts-profiles-dialog',
      // backdropClass: 'custom-bd'
      dateDialog.afterOpen().subscribe(()=>{this.selected = true;});

      dateDialog.afterClosed().subscribe(dates =>{
        if(dates){
          this.value = dates['text'];
          this.toDate = dates['to'];
          this.fromDate = dates['from'];
          this.ontextupdate.emit({'to':dates['to'], 'from': dates['from']});
        }
      });
    } else if (selected && this.type.includes('multi')) {
      console.log(this.type.substring(5))
      const dateDialog = this.dialog.open(InputHelperDialogComponent, {
        width: '900px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd',
        data: {'type': this.type.substring(5), 'selections': this.selections, 'toggleState': this.toggleState}
      });

      dateDialog.afterOpen().subscribe(()=>{this.selected = true;});

      dateDialog.afterClosed().subscribe(data =>{
        if(data){
          this.value = data['text'];
          this.selections = data['selection']
          this.toggleState = data['toggleState'];
          this.onselectionupdate.emit(this.selections);
          this.ontoggleupdate.emit(this.toggleState);
        }
      });
    }
  }

  changeAction(change: any){
    if(this.type == 'text'){
      this.ontextupdate.emit(change);
    }
  }

  // onSearch(search: string) {
  //   if(search!=='')
  //     this.searchOptions = this.http.get<Paged<any>>(this.searchEndpoint + (search === '' ? '' : '&search=' + encodeURI(search))).toPromise().then(paged => this.removeDuplicateOptions(paged.results));
  //   else
  //     this.searchOptions = null;
  //     this.value = '';
  // }

  // removeSelection(selection: any) {
  //   var index = this.selections.indexOf(selection, 0);
  //   if (index > -1) {
  //     this.selections.splice(index, 1);
  //   }
  //   this.onselectionupdate.emit(this.selections);
  //   this.onSearch('');
  // }

  // addStudent(selection: any) {
  //   this.value = '';
  //   this.onSearch('');
  //   if (!this.selections.includes(selection)) {
  //     this.selections.push(selection);
  //     this.onselectionupdate.emit(this.selections);
  //   }
  // }

  // removeDuplicateOptions(options): any[] {
  //   let fixedOptions: any[] = options;
  //   let optionsToRemove: any[] = [];
  //   for (let selectedStudent of this.selections) {
  //     for (let student of fixedOptions) {
  //       if (selectedStudent.id === student.id) {
  //         optionsToRemove.push(student);
  //       }
  //     }
  //   }

  //   for (let optionToRemove of optionsToRemove) {
  //     var index = fixedOptions.indexOf(optionToRemove, 0);
  //     if (index > -1) {
  //       fixedOptions.splice(index, 1);
  //     }
  //   }

  //   return fixedOptions;
  // }

}
