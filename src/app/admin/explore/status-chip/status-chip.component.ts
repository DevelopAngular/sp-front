import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {finalize, tap, take} from 'rxjs/operators';
import {Status} from '../../../models/Report';
import {StatusEditorComponent} from '../status-editor/status-editor.component';
import {StatusNotifyerService} from '../status-notifyer.service';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss'],
})
export class StatusChipComponent implements OnInit {

  @Input() status: Status;
  @Input() editable: boolean;
  @Input() remoteid: number;
  @ViewChild('button') trigger: ElementRef<HTMLElement>;

  @Output() statusClick: EventEmitter<Status> = new EventEmitter<Status>();

  // text representing status
  label: string;
  // class associated with status
  classname: string;

  // did open the panel with status options 
  didOpen: boolean = false;

  // shows a loading hint
  isLoading: boolean = false;

  constructor(
    public dialog: MatDialog,
    public notifyer: StatusNotifyerService, 
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.redress();
    this.didOpen = false;
    this.isLoading = false;
  }

  redress() {
    this.label = this.status;
    this.classname = this.status;
  }

  blink($event: MouseEvent) {
    $event.stopPropagation();
    this.statusClick.emit(this.status);

    if (this.editable) {
      const data = {
        trigger: this.trigger.nativeElement,
        prevstatus: this.status,
      } 
      if (!!this.remoteid) {
        data['remoteid'] = this.remoteid;
      }
      const conf = {
        id: `status_editor`,
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data,
      };
      const chosen = this.dialog.open(StatusEditorComponent, conf);
      this.didOpen = true;
     
      chosen.afterClosed()
      .pipe(
        take(1),
        tap(v => {
          UNANIMATED_CONTAINER.next(true);
          if (this.status !== v?.status) this.isLoading = true;
        }),
        finalize(() => {
          UNANIMATED_CONTAINER.next(false);
          this.didOpen = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
      
      this.notifyer.getStatus()
      .pipe(
        take(1),
        tap(v => {
          UNANIMATED_CONTAINER.next(true);
          this.status = v;
          this.redress();
        }),
        finalize(() => {
          UNANIMATED_CONTAINER.next(false);
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      ).subscribe();
    }
  }

}
