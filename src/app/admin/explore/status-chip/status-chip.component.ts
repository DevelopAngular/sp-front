import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Subject, BehaviorSubject, Observable} from 'rxjs';
import {last, finalize, tap, takeUntil, distinctUntilChanged, catchError} from 'rxjs/operators';
import {Status, ReportDataUpdate} from '../../../models/Report';
import {StatusEditorComponent} from '../status-editor/status-editor.component';
import {AdminService} from '../../../services/admin.service';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss'],
})
export class StatusChipComponent implements OnInit {

  @Input() status: Status;
  @ViewChild('button') trigger: ElementRef<HTMLElement>;

  // editable indicate that can drop down a stus choices
  @Input() editable: boolean;
  // remoteid is the record id of a database record
  @Input() remoteid: number;

  @Output() statusClick: EventEmitter<Status> = new EventEmitter<Status>();

  // text representing status
  label: string;
  // class associated with status
  classname: string;
  // did open the panel with status options 
  didOpen: boolean = false;
  // shows a loading hint
  isLoading: boolean = false;

  private chosenStatus$: Subject<Status> = new Subject();
  private hasChanged$;//: Subject<string | number> = new Subject();
  private destroy$ = new Subject();

  constructor(
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    public adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.redress();
    this.didOpen = false;
    this.isLoading = false;
    this.hasChanged$ = this.adminService.reports.currentReportId$;//.subscribe(this.hasChanged$);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    //this.hasChanged$.next(this.status);
    //this.hasChanged$.complete();
  }

  redress() {
    this.label = this.status;
    this.classname = this.status;
  }

  blink($event: MouseEvent) {
    $event.stopPropagation();

    if (!this.editable) {
      this.statusClick.emit(this.status);
    } else {
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
        takeUntil(this.destroy$),
        tap(v => {
          UNANIMATED_CONTAINER.next(true);
          // v can be undefined when user has opened choices 
          // but he has renounced to choose one of them
          if (!!v && (this.status !== v.status)) { 
            this.chosenStatus$.next(v.status);
          }
        }),
        finalize(() => {
          UNANIMATED_CONTAINER.next(false);
          this.didOpen = false;
          this.cdr.detectChanges();
        }),
      ).subscribe();

      this.chosenStatus$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap((status: Status) => {
          this.status = status;
          UNANIMATED_CONTAINER.next(true);
          this.isLoading = true;
          const updata: ReportDataUpdate = {
            status,
            id: ''+this.remoteid,
          }
          return this.adminService.updateReportRequest(updata)
        }),
        catchError(err => err),
        finalize(() => {
          UNANIMATED_CONTAINER.next(false);
          this.isLoading = false;
          this.statusClick.emit(this.status);
          this.cdr.detectChanges();
        }),
      ).subscribe();

      this.hasChanged$
      .pipe(
        last(),
        tap(remoteid => {
        console.log(remoteid, this.remoteid);
      }))
      .subscribe(() => {
        this.redress();
      });
    }
  }

}
