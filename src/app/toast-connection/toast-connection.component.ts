import {Component, OnDestroy, OnInit} from '@angular/core';
import { WebConnectionService } from '../services/web-connection.service';

import {delay, filter, takeUntil} from 'rxjs/operators';
import { Subject } from 'rxjs';
import {MatDialogConfig, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-toast-connection',
  templateUrl: './toast-connection.component.html',
  styleUrls: ['./toast-connection.component.scss']
})
export class ToastConnectionComponent implements OnInit, OnDestroy {

  subscriber$ = new Subject();
  isConnect: boolean;

  constructor(
      private connection: WebConnectionService,
      private dialogRef: MatDialogRef<ToastConnectionComponent>
  ) { }

  ngOnInit() {
    this.updatePosition();
    this.connection.checkConnection()
        .pipe(
            takeUntil(this.subscriber$),
            filter(res => res),
            delay(2000))
        .subscribe(connect => {
            this.isConnect = connect;
            setTimeout(() => {
              this.dialogRef.close();
            }, 2000);
    });
  }

  updatePosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      matDialogConfig.position = { top: `15px` };
      this.dialogRef.updatePosition(matDialogConfig.position);
  }

  ngOnDestroy() {
    this.subscriber$.next(null);
    this.subscriber$.complete();
  }

}
