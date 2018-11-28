import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DateInputComponent } from '../date-input/date-input.component';
import { HallpassFormComponent } from '../../hallpass-form/hallpass-form.component';
import { Paged } from '../../location-table/location-table.component';
import { HttpService } from '../../http-service';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.scss']
})
export class RoundInputComponent implements AfterViewInit {

  @Input() labelText: string;
  @Input() placeholder: string;
  @Input() type: string; //Can be 'text', 'chips', or 'dates'
  @Input() searchEndpoint: any; //API endpoint to search from
  @Input() hasTogglePicker: boolean;
  @Input() width: string;
  @Input() minWidth: string;

  @Output() ontextupdate: EventEmitter<any> = new EventEmitter();
  @Output() ontoogleupdate: EventEmitter<any> = new EventEmitter();
  @Output() onchipupdate: EventEmitter<any> = new EventEmitter();

  selected: boolean;
  value: any;
  toDate: Date;
  fromDate: Date;
  searchOptions: Promise<any[]>;
  selections: any[] = ['Yo', 'Hey', 'Testing', 'Yo', 'Hey', 'Testing', 'Yo', 'Hey', 'Testing', 'Yo', 'Hey', 'Testing', 'Yo', 'Hey', 'Testing'];
  chipListHeight: string = '40px';

  constructor(public dialog: MatDialog, private http: HttpService) { }

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    if(this.type == 'chips'){
      console.log(this.getHeight(this.chipList.nativeElement))
    }
  }

  @ViewChild('chipList', { read: ElementRef }) chipList:ElementRef;

  getHeight(element){
    element = element.cloneNode(true);
    element.style.visibility = "hidden";
    document.body.appendChild(element);
    var height = element.offsetHeight + 0;
    document.body.removeChild(element);
    element.style.visibility = "visible";
    return height;
  }

  focusAction(selected: boolean){
    this.selected = selected;
    if(selected && this.type == 'dates'){
      const dateDialog = this.dialog.open(DateInputComponent, {
        width: '900px',
        panelClass: 'form-dialog-container',
        backdropClass: 'custom-bp',
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
    } else if(this.type == 'chips'){
      this.onSearch(change);
    }
  }

  onSearch(search: string) {
    if(search!=='')
      this.searchOptions = this.http.get<Paged<any>>(this.searchEndpoint + (search === '' ? '' : '&search=' + encodeURI(search))).toPromise().then(paged => this.removeDuplicateOptions(paged.results));
    else
      this.searchOptions = null;
      this.value = '';
  }

  removeSelection(selection: any) {
    var index = this.selections.indexOf(selection, 0);
    if (index > -1) {
      this.selections.splice(index, 1);
    }
    this.onchipupdate.emit(this.selections);
    this.onSearch('');
  }

  addStudent(selection: any) {
    this.value = '';
    this.onSearch('');
    if (!this.selections.includes(selection)) {
      this.selections.push(selection);
      this.onchipupdate.emit(this.selections);
    }
  }

  removeDuplicateOptions(options): any[] {
    let fixedOptions: any[] = options;
    let optionsToRemove: any[] = [];
    for (let selectedStudent of this.selections) {
      for (let student of fixedOptions) {
        if (selectedStudent.id === student.id) {
          optionsToRemove.push(student);
        }
      }
    }

    for (let optionToRemove of optionsToRemove) {
      var index = fixedOptions.indexOf(optionToRemove, 0);
      if (index > -1) {
        fixedOptions.splice(index, 1);
      }
    }

    return fixedOptions;
  }

}
