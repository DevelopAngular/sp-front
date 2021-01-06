import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Pinnable} from '../../models/Pinnable';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {HallPassesService} from '../../services/hall-passes.service';
import {DragulaService} from 'ng2-dragula';

@Component({
  selector: 'app-pinnable-collection',
  templateUrl: './pinnable-collection.component.html',
  styleUrls: ['./pinnable-collection.component.scss']
})
export class PinnableCollectionComponent implements OnInit {

  @Input()
  pinnables: Pinnable[];

  @Input()
  header: boolean = true;

  @Input() resetBulkSelect$: BehaviorSubject<boolean>;

  @Input() width: string = '635px';

  @Input() isEmptyState: boolean = false;

  @Input() bulkSelect: boolean  = false;

  @Input() selectedPinnables: Pinnable[] = [];

  @Output()
  roomEvent: EventEmitter<any> = new EventEmitter();
  @Output()
  orderChangedEvent: EventEmitter<number[]> = new EventEmitter<number[]>();

  @Output() bulkSelectEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

  disabledClick$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  pinnableIdArranged = [];

  constructor(
    public dialog: MatDialog,
    public darkTheme: DarkThemeSwitch,
    public passesService: HallPassesService,
    private dragula: DragulaService
  ) {}

  ngOnInit() {
    this.dragula.drop('pinnables').subscribe(res => {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        this.disabledClick$.next(true);
      }
    });
    setTimeout(() => {
      this.pinnableIdArranged = this.pinnables.map(pin => pin.id);
      // console.log(this.pinnableIdArranged);
        if (!this.pinnableIdArranged.length) {
          this.isEmptyState = true;
        }
    }, 1000);
    if (this.resetBulkSelect$) {
        this.resetBulkSelect$.subscribe((val: boolean) => {
            if (val) {
                this.bulkSelect = false;
            }
        });
    }
  }

  onPinablesOrderChanged(newOrder) {
    this.pinnables = newOrder;
    this.orderChangedEvent.emit(newOrder);
  }

  toggleBulk() {
    this.bulkSelect = !this.bulkSelect;
    this.selectedPinnables = [];
    this.bulkSelectEmit.emit(this.bulkSelect);
  }

  isSelected(pinnable: Pinnable): boolean {
    return this.selectedPinnables.findIndex((P: Pinnable) => P.id === pinnable.id) !== -1;
  }

  updatePinnables(pinnable: Pinnable) {
    if (this.disabledClick$.getValue()) {
      this.disabledClick$.next(false);
      return false;
    }
    if (!!this.selectedPinnables.find(pin => pin.id === pinnable.id)) {
     return this.selectedPinnables.splice(this.selectedPinnables.indexOf(pinnable), 1);
    } else {
      if (this.bulkSelect) {
          this.selectedPinnables.push(pinnable);
          this.roomEvent.emit({ action: 'simple', selection: this.selectedPinnables });
          return;
      }
    }
      if (!this.header) {
        this.selectedPinnables.push(pinnable);
        this.roomEvent.emit(this.selectedPinnables);
      } else {
        this.roomEvent.emit({ action: 'room/folder_edit', selection: pinnable });
      }
  }
}
