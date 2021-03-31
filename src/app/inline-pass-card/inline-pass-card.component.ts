import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {HallPass} from '../models/HallPass';
import {HttpService} from '../services/http-service';
import {DataService} from '../services/data-service';
import {interval, merge, of} from 'rxjs';
import {map, pluck} from 'rxjs/operators';
import {HallPassesService} from '../services/hall-passes.service';
import {TimeService} from '../services/time.service';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {MatDialog} from '@angular/material/dialog';
import {BigStudentPassCardComponent} from '../big-student-pass-card/big-student-pass-card.component';
import {ScreenService} from '../services/screen.service';
import {Util} from '../../Util';

@Component({
  selector: 'app-inline-pass-card',
  templateUrl: './inline-pass-card.component.html',
  styleUrls: ['./inline-pass-card.component.scss']
})

export class InlinePassCardComponent implements OnInit, OnDestroy {

  @Input() pass: HallPass;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() isOpenBigPass: boolean = false;

  timeLeft: string = '';
  valid: boolean = true;
  returnData: any = {};
  overlayWidth: number = 0;
  buttonWidth: number = 288;

  selectedDuration: number;
  selectedTravelType: string;
  performingAction: boolean;
  subscribers$;

  constructor(
      private http: HttpService,
      private dataService: DataService,
      private hallPassService: HallPassesService,
      private timeService: TimeService,
      private shortcutsService: KeyboardShortcutsService,
      private dialog: MatDialog,
      private screen: ScreenService
  ) { }

    get gradient() {
        return 'radial-gradient(circle at 73% 71%, ' + this.pass.color_profile.gradient_color + ')';
    }

  ngOnInit() {
      this.subscribers$ = merge(of(0), interval(1000)).pipe(map(x => {
          if (!!this.pass && this.isActive) {
              const end: Date = this.pass.expiration_time;
              const now: Date = this.timeService.nowDate();
              const diff: number = (end.getTime() - now.getTime()) / 1000;
              const mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
              const secs: number = Math.abs(Math.floor(diff) % 60);
              this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
              this.valid = end > now;

              const start: Date = this.pass.start_time;
              const dur: number = Math.floor((end.getTime() - start.getTime()) / 1000);
              this.overlayWidth = (this.buttonWidth * (diff / dur));
              return x;
          }
      })).subscribe();
      this.shortcutsService.onPressKeyEvent$
        .pipe(pluck('key'))
        .subscribe(key => {
          if (key[0] === 'e') {
            this.endPass();
          }
        });
  }

  ngOnDestroy() {
    this.subscribers$.unsubscribe();
    this.closeDialog();
  }

  endPass() {
    this.performingAction = true;
    this.hallPassService.endPass(this.pass.id).subscribe(data => {
      console.log('[Pass Ended]', data);
    });
  }

  closeDialog() {
    if (this.dialog.getDialogById('bigPass')) {
      this.screen.customBackdropEvent$.next(!!this.dialog.getDialogById('startNotification'));
      this.screen.customBackdropStyle$.next(null);
      this.dialog.getDialogById('bigPass').close();
    }
  }

  openBigPassCard() {
    if (!this.isOpenBigPass) {
      this.screen.customBackdropEvent$.next(true);
      const solidColor = Util.convertHex(this.pass.color_profile.solid_color, 70);
      setTimeout(() => {
        this.screen.customBackdropStyle$.next({
          'background': `linear-gradient(0deg, ${solidColor} 100%, rgba(0, 0, 0, 0.3) 100%)`,
        });
      }, 50);
      const bigPassCard = this.dialog.open(BigStudentPassCardComponent, {
        id: 'bigPass',
        panelClass: 'main-form-dialog-container',
        data: {
          pass: this.pass,
          isActive: true,
          forInput: false,
          passLayout: 'inlinePass'
        }
      });
    } else {
      this.closeDialog();
    }
  }

}
