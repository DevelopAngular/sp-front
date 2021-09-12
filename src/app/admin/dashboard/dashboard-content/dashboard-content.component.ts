import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../services/http-service';
import {AdminService} from '../../../services/admin.service';
import {HallPassesService} from '../../../services/hall-passes.service';
import {DataService} from '../../../services/data-service';
import {HallPassFilter, LiveDataService} from '../../../live-data/live-data.service';
import {PdfGeneratorService} from '../../pdf-generator.service';
import {MatDialog} from '@angular/material/dialog';
import {TimeService} from '../../../services/time.service';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {ThemeService} from 'ng2-charts';
import {UserService} from '../../../services/user.service';
import {combineLatest, interval, Observable, of, Subject} from 'rxjs';
import {Report} from '../../../models/Report';
import {Onboard} from '../../../models/Onboard';
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {HallPass} from '../../../models/HallPass';
import {CalendarComponent} from '../../calendar/calendar.component';
import {isEmpty} from 'lodash';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.scss']
})
export class DashboardContentComponent implements OnInit, OnDestroy {

  @ViewChild('ctx', { static: true }) ctx: any;

  public chartsDate: Date;
  public activeCalendar: boolean;


  private shareChartData$: Subject<any> = new Subject();
  public lineChartData: Array<any> = [{data: Array.from(Array(9).keys()).map(() => 0)}];

  public lineChartLabels: Array<any> = [];

  public lineChartOptions: any;
  public gradient: any;
  public lineChartColors: Array<any>;
  public lineChartLegend: boolean = false;
  public lineChartType: string = 'line';
  public passStatistic: any[] | string;
  public numActivePasses = -1;
  public reports: Report[];
  public averagePassTime: number | string;
  public hiddenChart: boolean = true;
  public devices: HTMLElement[];

  public onboardProgress$: Observable<{[id: string]: Onboard}>;
  public onboardProcessLoaded$: Observable<boolean>;

  public lineChartTicks: any = {
    suggestedMin: 0,
    precision: 0,
    fontColor: this.darkTheme.getColor({white: '#999999', dark: '#FFFFFF'})
    // stepSize: 5,
  };

  constructor(
    private http: HttpService,
    private adminService: AdminService,
    private hallPassService: HallPassesService,
    private dataService: DataService,
    private liveDataService: LiveDataService,
    private pdf: PdfGeneratorService,
    private _zone: NgZone,
    private dialog: MatDialog,
    private timeService: TimeService,
    private host: ElementRef,
    public darkTheme: DarkThemeSwitch,
    private chartTheming: ThemeService,
    public userService: UserService
  ) { }


  get cardHeaderColor() {
    return this.darkTheme.getColor({white: '#1E194F', dark: '#FFFFFF'});
  }

  get calendarIcon() {

    if (!this.chartsDate) {
      return this.darkTheme.getIcon({
        iconName: 'Calendar',
        lightFill: 'Navy',
        darkFill: 'White',
      });


    } else {
      return './assets/Calendar (Blue).svg';
    }
//     ( !this.chartsDate ? './assets/Calendar (Navy).svg' : './assets/Calendar (Blue).svg')
  }
  getCardIcon(icon) {
    return this.darkTheme.getIcon({
      iconName: icon,
      darkFill: 'White',
      lightFill: 'Navy'
    });
  }

  ngOnInit() {
    this.drawChartXaxis();
    this.darkTheme.isEnabled$.subscribe(() => {
      this.chartTheming.setColorschemesOptions({
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin: 0,
              fontColor: this.darkTheme.getColor({white: '#999999', dark: '#FFFFFF'})
              // stepSize: 5,
            },
            gridLines: {
              display: true,
              borderDash: [10, 10],
              drawBorder: true
            },
            scaleLabel: {
              display: true,
              fontColor: this.darkTheme.getColor({white: '#134482', dark: '#FFFFFF'}),
              fontSize: 14,
              labelString: 'Number of active passes',
              padding: 20
            }
          }],
          xAxes: [{
            ticks: {
              fontColor: this.darkTheme.getColor({white: '#999999', dark: '#FFFFFF'})
            },
            gridLines: {
              display: false,
            },
            scaleLabel: {
              display: true,
              fontColor: this.darkTheme.getColor({white: '#134482', dark: '#FFFFFF'}),
              fontSize: 14,
              labelString: 'Time',
              padding: 10,
            },
          }]
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          position: 'nearest',
          displayColors: false,
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0, 0, 0, .1)',
          borderWidth: 1,
          bodyFontColor: '#134482',
          bodyFontSize: 22,
          footerFontSize: 14,
          footerFontColor: '#134482',
          footerFontStyle: 'normal',
          xPadding: 22,
          yPadding: 14,
          callbacks: {
            labelColor: (tooltipItem, chart) => {
              return {
                borderColor: 'rgb(100, 0, 0)',
                backgroundColor: 'rgba(100, 0, 0, .4)'
              };
            },
            label: (tooltipItems, data) => {

              let _label = new String(tooltipItems.yLabel);
              _label = _label.padStart(7, ' ');
              return <string>_label;
            },
            footer: (tooltipItems, data) => {
              return 'active passes';
            }
          }
        }
      });
    });

    this.liveDataService.watchActiveHallPasses(new Subject<HallPassFilter>().asObservable())
      .pipe(takeUntil(this.shareChartData$))
      .subscribe((activeHallpasses: HallPass[]) => {
        // console.log('Watch activity ======>', activeHallpasses);
        this.numActivePasses = activeHallpasses.length;
      });

    const todayReports = this.liveDataService.getDateRange(this.timeService.nowDate());

    this.http.globalReload$.pipe(
      switchMap(() => {
        return combineLatest(
          this.hallPassService.getPassStatsRequest().pipe(filter(res => !!res)),
          this.adminService.searchReportsRequest(todayReports.end.toISOString(), todayReports.start.toISOString()),
          this.adminService.getDashboardDataRequest().pipe(filter(res => !!res))
        );
      }),
      filter(([stats, eventReports, dashboard]) => !isEmpty(stats)),
      takeUntil(this.shareChartData$),
    )
      .subscribe(([stats, eventReports, dashboard]: any) => {
        for (const entry of stats) {
          switch (entry.name) {
            case 'Most Visited Locations':
              this.passStatistic = entry['rows'].length ? entry['rows'] : [];
              break;
            case 'Average pass time':
              this.averagePassTime = entry['value'] ? entry['value'] : 'Unknown';
              break;
          }

          if (!stats.find((item) => item['name'] === 'Average pass time')) {
            this.averagePassTime = 'Unknown';
          }
        }

        this.reports = eventReports;
        delete this.lineChartTicks.stepSize;
        // if (environment.funData) {
        //   this.lineChartData = [{data: dashboard.hall_pass_usage.slice(7, 16).map(numb => numb +  Math.ceil((Math.random() * Math.random() * 300)))}];
        // } else {
        this.lineChartData = [{data: dashboard.hall_pass_usage.slice(7, 16)}];
        // }
        this.hiddenChart = false;
        // this.darkTheme.preloader.next(false);
      });

    interval(60000)
      .pipe(
        filter(() => false),
        takeUntil(this.shareChartData$),
        switchMap(() => {
          return this.adminService.getDashboardDataRequest();
        }),
      )
      .subscribe((result: any) => {
        this.lineChartData = [{
          // data: result.hall_pass_usage.map(numb => numb + Math.ceil((Math.random() * Math.random() * 30)))
          data: result.hall_pass_usage.slice(7, 16)
        }];
      });

    this.gradient = this.ctx.nativeElement.getContext('2d').createLinearGradient(0, 380, 0, 0);
    this.gradient.addColorStop(0.5, 'rgba(0,207,49,0.01)');
    this.gradient.addColorStop(1, 'rgba(0,180, 118, 0.8)');
    this.lineChartColors = [
      {
        backgroundColor: this.gradient,
        pointBackgroundColor: 'transparent',
        borderColor: 'rgba(0,159,0,1)',
        pointHoverBackgroundColor: '#FFFFFF',
        pointBorderColor: 'transparent',
        pointBorderWidth: 3,
        pointHoverRadius: 6,
        pointHoverBorderColor: '#134482'
      }
    ];
    this.lineChartOptions = {
      scales: {
        yAxes: [{
          ticks: this.lineChartTicks,
          gridLines: {
            display: true,
            borderDash: [10, 10],
            drawBorder: true
          },
          scaleLabel: {
            display: true,
            fontColor: '#134482',
            fontSize: 14,
            labelString: 'Number of active passes',
            padding: 20
          }
        }],
        xAxes: [{
          ticks: {
            fontColor: this.darkTheme.getColor({white: '#999999', dark: '#FFFFFF'})
          },
          gridLines: {
            display: false,
          },
          scaleLabel: {
            display: true,
            fontColor: '#134482',
            fontSize: 14,
            labelString: 'Time',
            padding: 10,
          },
        }]
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        position: 'nearest',
        x: 10,
        y: 10,
        displayColors: false,
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, .1)',
        borderWidth: 1,
        bodyFontColor: '#134482',
        bodyFontSize: 22,
        footerFontSize: 14,
        footerFontColor: '#134482',
        footerFontStyle: 'normal',
        xPadding: 22,
        yPadding: 14,
        callbacks: {
          labelColor: (tooltipItem, chart) => {
            return {
              borderColor: 'rgb(100, 0, 0)',
              backgroundColor: 'rgba(100, 0, 0, .4)'
            };
          },
          label: (tooltipItems, data) => {

            let _label = new String(tooltipItems.yLabel);
            _label = _label.padStart(7, ' ');
            return _label;
          },
          footer: (tooltipItems, data) => {
            return 'active passes';
          }
        }
      }
    };
    this.onboardProcessLoaded$ = this.adminService.loadedOnboardProcess$;
    this.onboardProgress$ = this.http.globalReload$
      .pipe(
        switchMap(() => {
          return this.adminService.getOnboardProcessRequest();
        })
      );
  }

  private drawChartXaxis() {
    let hour = 8;
    // let _minute_iterator = 0;
    // const _quater_hour = 15;
    while (hour <= 16) {
      // let minutes = _minute_iterator * _quater_hour;
      let time;
      // if (_minute_iterator === 4) {
      //   _minute_iterator = 0;
      //   minutes = 0;
      //   hour++;
      // }
      if ((hour) <= 12) {
        // time = `${hour}:${minutes !== 0 ? minutes : minutes + '0'} ${hour < 12 ? 'AM' : 'PM'}`;
        time = `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`;
      } else {
        time = `${(hour - 12)}:00 PM`;
      }
      hour++;
      // _minute_iterator++;
      this.lineChartLabels.push(time);
    }
  }

  previewPDF() {

    const data = this.hallPassService.getActivePasses();

    data
      .pipe(
        takeUntil(this.shareChartData$),
        tap((hp_list: HallPass[]) => {
          this._zone.run(() => {
            this.numActivePasses = hp_list.length;
          });
        }),
        map((hp_list: HallPass[]) => {
          return hp_list.map(hp => {
            return {
              'Student Name': hp.student.display_name,
              'Origin': hp.origin.title,
              'Destination': hp.destination.title,
              // 'Travel Type': hp.travel_type
              'Travel Type': hp.travel_type
                .split('_')
                .map(chunk => chunk.slice(0, 1).toUpperCase()).join('')
            };
          });
        }),
        switchMap((active_hp) => {
          if (active_hp.length) {
            return this.pdf.generateReport(active_hp, 'p', 'dashboard');
          }
        })
      ).subscribe();
  }


  openDateDialog(event) {

    this.activeCalendar = true;
    const target = new ElementRef(event.currentTarget);
    const DR = this.dialog.open(CalendarComponent, {
      panelClass: 'calendar-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': target,
        'previousSelectedDate': this.chartsDate ? new Date(this.chartsDate) : null,
      }
    });

    DR.afterClosed()
      .pipe(
        switchMap((data) => {
          if (data.date) {
            if ( !this.chartsDate || (this.chartsDate && this.chartsDate.getTime() !== data.date.getTime()) ) {
              this.chartsDate = new Date(data.date);
              return this.adminService.getFilteredDashboardData(this.chartsDate);
            }
          } else {
            return of(null);
          }
        }))
      .subscribe((dashboard: any) => {
          if (dashboard) {
            this.lineChartData = [{data: dashboard.hall_pass_usage.slice(7, 16)}];
          }
          this.activeCalendar = false;
        }
      );
  }

  ngOnDestroy() {
    this.shareChartData$.next();
    this.shareChartData$.complete();
  }

}
