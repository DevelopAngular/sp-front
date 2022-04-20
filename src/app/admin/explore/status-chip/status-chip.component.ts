import {Component, OnInit, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {filter, map} from 'rxjs/operators';
import {Status} from '../../../models/Report';
import {StatusEditorComponent} from '../status-editor/status-editor.component';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss']
})
export class StatusChipComponent implements OnInit {

  @Input() status: Status;
  @Input() editable: boolean;

  @Output() statusClick: EventEmitter<Status> = new EventEmitter<Status>();

  // text representing status
  label: string;
  // class associated with status
  classname: string;

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.label = this.status;
    this.classname = this.status;
  }

  ngAfterViewInit() {
  }

  blink($event) {
    $event.stopPropagation();
    const target = $event.target.parentElement;
    this.statusClick.emit(this.status);
    if (this.editable) {
      UNANIMATED_CONTAINER.next(true);
      const conf = {
        id: `status_editor`,
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          trigger: target 
        } 
      };
      const chosen = this.dialog.open(StatusEditorComponent, conf);
      chosen.afterClosed()
      .subscribe(s => {
        console.log(s);
        UNANIMATED_CONTAINER.next(false);
      })
    }
  }

}
