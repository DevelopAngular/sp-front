import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {TimeService} from '../../services/time.service';
import {InputHelperDialogComponent} from '../input-helper-dialog/input-helper-dialog.component';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.scss'],
})
export class RoundInputComponent implements OnInit {

  @ViewChild('input') input: ElementRef;

  @Input() labelText: string;
  @Input() placeholder: string;
  @Input() type: string;
  //Can be 'text', 'multilocation', 'multiuser', or 'dates'  There may be some places where multiuser may need to be split into student and teacher. I tried finding a better way to do this, but this is just short term.
  @Input() initialValue: string = ''; // Allowed only if type is multi*
  @Input() html5type: string = 'text'; // text, password, number etc.
  @Input() hasTogglePicker: boolean;
  @Input() width: string;
  @Input() minWidth: string = '300px';
  @Input() fieldIcon: string = './assets/Search Input (Blue).png';
  @Input() fieldIconPosition: string = 'left'; // Can be 'right' or 'left'
  @Input() closeIcon: boolean = false;
  @Input() disabled: boolean = false;
  @Input() focused: boolean = false;
  @Input() chipInput: ElementRef = null;
  @Input() selectReset$: Subject<string>;
  @Input() selections: any[] = [];
  @Output() ontextupdate: EventEmitter<any> = new EventEmitter();
  @Output() ontoggleupdate: EventEmitter<any> = new EventEmitter();
  @Output() onselectionupdate: EventEmitter<any> = new EventEmitter();
  @Output() controlValue = new EventEmitter();
  closeIconAsset: string = './assets/Close Input (Grey).svg';
  showCloseIcon: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selected: boolean;
  value: string;
  toDate: Date;
  fromDate: Date;
  searchOptions: Promise<any[]>;
  chipListHeight: string = '40px';
  toggleState: string = 'Either';

  public e: Observable<Event>;

  constructor(public dialog: MatDialog, private timeService: TimeService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {

    if (!this.type.includes('multi') && this.type !== 'text') {
      this.initialValue = '';
    }
    // if ( this.selections[0] && this.selections[0] instanceof Location) {
    //   const titleArray = this.selections[0].map((loc) => {
    //     return `${loc.title}(${loc.room})`;
    //   });
    //   this.initialValue = titleArray.join(', ');
    // }

    this.value = this.initialValue;
    // debugger;
    console.log(this.value);
    setTimeout(() => {
      if (this.input && this.focused) {
        this.focusAction(true);
        this.focus();
        // this.changeAction(this.input.nativeElement, true);
      }
    }, 500);

    if (this.selectReset$) {
      this.selectReset$.subscribe((_value: string) => {
        this.value = _value;
      });
    }
  }

  focus() {
    this.input.nativeElement.focus();
  }

  focusAction(selected: boolean) {
    // this.selected = selected;
    if (selected && this.type === 'dates') {
      const now = this.timeService.nowDate();
      const dateDialog = this.dialog.open(InputHelperDialogComponent, {
        width: '900px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd',
        data: {
          'type': 'dates',
          'to': this.toDate ? this.toDate : now ,
          'from': this.fromDate ? this.fromDate : now
        }
      });
      // panelClass: 'accounts-profiles-dialog',
      // backdropClass: 'custom-bd'
      dateDialog.afterOpen().subscribe(() => { this.selected = true; });

      dateDialog.afterClosed().subscribe(dates =>{
        if(dates){
          this.value = dates['text'];
          this.toDate = dates['to'];
          this.fromDate = dates['from'];
          this.ontextupdate.emit({'to': dates['to'], 'from': dates['from']});
        }
      });
    } else if (selected && this.type.includes('multi')) {
      console.log(this.type.substring(5))
      const dateDialog = this.dialog.open(InputHelperDialogComponent, {
        width: '1018px',
        height: '560px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd',
        data: {'type': this.type.substring(5), 'selections': this.selections, 'toggleState': this.toggleState}
      });

      dateDialog.afterOpen().subscribe(() => {this.selected = true;});

      dateDialog.afterClosed().subscribe(data => {
        if (data) {
          this.value = data['text'];
          this.selections = data['selection'];
          this.toggleState = data['toggleState'];
          this.onselectionupdate.emit(this.selections);
          this.ontoggleupdate.emit(this.toggleState);
        }
      });
    }
  }

  changeAction(inp: HTMLInputElement, reset?: boolean) {
    if (reset) {
      // this.selected = reset;
      inp.value = '';
      inp.focus();
    }
    if (this.type === 'text') {
      this.ontextupdate.emit(inp.value);
    }
    if ( inp.value.length > 0) {
        this.showCloseIcon.next(true);
    } else {
      setTimeout(() => {
        this.showCloseIcon.next(false);
      }, 220);
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
