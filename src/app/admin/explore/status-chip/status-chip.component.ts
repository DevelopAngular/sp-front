import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {finalize, tap} from 'rxjs/operators';
import {Status} from '../../../models/Report';
import {StatusEditorComponent} from '../status-editor/status-editor.component';
import {StatusNotifyerService} from '../status-notifyer.service';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss']
})
export class StatusChipComponent implements OnInit {

  @Input() status: Status;
  @Input() editable: boolean;
  @ViewChild('button') trigger: ElementRef<HTMLElement>;

  @Output() statusClick: EventEmitter<Status> = new EventEmitter<Status>();

  // text representing status
  label: string;
  // class associated with status
  classname: string;

  // did open the panel with status options 
  didOpen: boolean = false;

  constructor(
    public dialog: MatDialog,
    public notifyer: StatusNotifyerService, 
  ) { }

  ngOnInit(): void {
    this.redress();
  }

  redress() {
    this.label = this.status;
    this.classname = this.status;
  }

  blink($event: MouseEvent) {
    $event.stopPropagation();
    this.statusClick.emit(this.status);

    if (this.editable) {
      const conf = {
        id: `status_editor`,
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          trigger: this.trigger.nativeElement
        } 
      };
      const chosen = this.dialog.open(StatusEditorComponent, conf);
      
      this.didOpen = true;
      
      const subDialog = chosen.afterClosed()
      .pipe(
        tap(() => UNANIMATED_CONTAINER.next(true)),
        finalize(() => UNANIMATED_CONTAINER.next(false)),
      )
      .subscribe(() => {
        this.didOpen = false;
      });
      
      const sub = this.notifyer.getStatus().subscribe((other:Status) => {
        this.status = other;
        this.redress();
        sub.unsubscribe();
      });
    }
  }

}
