import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { filter, finalize, map, tap, take, takeUntil, distinctUntilChanged, catchError } from 'rxjs/operators';
import { Status, Report, ReportDataUpdate } from '../../../models/Report';
import { StatusEditorComponent } from '../status-editor/status-editor.component';
import { AdminService } from '../../../services/admin.service';
import { ReportUpdateService } from '../../../services/report-update.service';
import { UNANIMATED_CONTAINER } from '../../../consent-menu-overlay';

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
	// allow event to propagate
	@Input() stopPropagation: boolean = false;
	// force status looks like it is hovered
	@Input() forceLookHovered: boolean = false;

	@Output() statusClick: EventEmitter<Status> = new EventEmitter<Status>();

	// text representing status
	label: string;
	// class associated with status
	classname: string;
	// did open the panel with status options
	didOpen: boolean = false;
	// shows a loading hint
	isLoading: boolean = false;

	private reportUpdated$?: Observable<any>;

	private destroy$ = new Subject();

	constructor(
		public dialog: MatDialog,
		private updateEvent: ReportUpdateService,
		private adminService: AdminService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		if (this.isLoading) return;

		this.redress();
		this.didOpen = false;
		this.isLoading = false;

		if (!this.editable) return;

		this.reportUpdated$ = this.adminService.reports.currentReport$.pipe(
			filter((v: Report) => {
				return !!v && '' + v.id === '' + this.remoteid;
			}),
			map((v: Report) => {
				this.status = v.status;
				this.isLoading = false;
				this.redress();
				this.cdr.detectChanges();
			}),
			takeUntil(this.destroy$)
		);

		this.reportUpdated$.subscribe();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	redress() {
		this.label = this.status;
		this.classname = this.status;
	}

	blink($event: MouseEvent) {
		if (!this.stopPropagation) {
			$event.stopPropagation();
		}

		if (!this.editable) {
			this.statusClick.emit(this.status);
		} else {
			const data = {
				trigger: this.trigger.nativeElement,
				prevstatus: this.status,
			};
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

			// gets status from panel of choices
			chosen
				.afterClosed()
				.pipe(
					take(1),
					filter((v) => !!v && this.status !== v.status && v.type === 'editedStatus'),
					map((v) => v.status),
					distinctUntilChanged(),
					map((status: Status) => {
						UNANIMATED_CONTAINER.next(true);
						//trigger visual hint
						this.isLoading = true;
						const updata: ReportDataUpdate = {
							status,
							id: this.remoteid,
						};
						this.updateEvent.emit(updata);
					}),
					finalize(() => {
						UNANIMATED_CONTAINER.next(false);
						this.didOpen = false;
						this.cdr.detectChanges();
					})
				)
				.subscribe();
		}
	}
}
