import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { disableBodyScroll } from 'body-scroll-lock';
import { interval, Subject, zip } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { DataService } from '../../services/data-service';
import { HttpService } from '../../services/http-service';
import { HallPassFilter, LiveDataService } from '../../live-data/live-data.service';
import { HallPass } from '../../models/HallPass';
import { Report } from '../../models/Report';
import { TimeService } from '../../services/time.service';
import { PdfGeneratorService } from '../pdf-generator.service';
import {CalendarComponent} from '../calendar/calendar.component';
import {MatDialog} from '@angular/material';
import {AdminService} from '../../services/admin.service';
import {HallPassesService} from '../../services/hall-passes.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // @ViewChild('draggableContainer') draggableContainer: ElementRef;
  @ViewChild('ctx') ctx: any;

  public chartsDate: Date;
  public activeCalendar: boolean;


  private shareChartData$: Subject<any> = new Subject();
  public lineChartData: Array<any> = [{data: Array.from(Array(24).keys()).map(() => 0)}];

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

  public lineChartTicks: any = {
    suggestedMin: 0,
    precision: 0
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
    private elRef: ElementRef,
    private dialog: MatDialog,
    private timeService: TimeService,
  ) {
  }

  ngOnInit() {
    // disableBodyScroll(this.elRef.nativeElement);
    // const _devices = this.draggableContainer.nativeElement.childNodes;
    // this.devices = Array.from(Array(_devices.length).keys()).map(index => _devices[index]);

    // console.log(this.draggableContainer.nativeElement.childNodes);

    this.drawChartXaxis();

    this.liveDataService.watchActiveHallPasses(new Subject<HallPassFilter>().asObservable())
      .subscribe((activeHallpasses: HallPass[]) => {
        // console.log('Watch activity ======>', activeHallpasses);
        this.numActivePasses = activeHallpasses.length;
      });

    const todayReports = this.liveDataService.getDateRange(this.timeService.nowDate());

    this.http.globalReload$.pipe(
      switchMap(() => {
        return zip(
          this.hallPassService.getPassStats(),
          this.adminService.searchReports(todayReports.end.toISOString(), todayReports.start.toISOString()),
          this.adminService.getDashboardData(),
        );
      }))
      .subscribe(([stats, eventReports, dashboard]: any[]) => {

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
        //   this.lineChartData = [{data: dashboard.hall_pass_usage.map(numb => numb +  Math.ceil((Math.random() * Math.random() * 300)))}];
        // } else {
        this.lineChartData = [{data: dashboard.hall_pass_usage}];
        // }
        this.hiddenChart = false;
      });

    interval(60000)
      .pipe(
        switchMap(() => this.adminService.getDashboardData()),
        takeUntil(this.shareChartData$)
      )
      .subscribe((result: any) => {
        this.lineChartData = [{
          // data: result.hall_pass_usage.map(numb => numb + Math.ceil((Math.random() * Math.random() * 30)))
          data: result.hall_pass_usage
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
      hover: {
        intersect: false,
        // onHover: (event, active) => {
        //   const context = this.ctx.nativeElement.getContext('2d');
        //
        //   console.log('1st step ===>');
        //   if (active && active.length) {
        //     console.log(active);
        //     context.beginPath();
        //     context.moveTo(active[0]._view.x, active[0]._view.y + 5);
        //     context.strokeStyle = '#134482';
        //     context.lineWidth = 2;
        //     context.lineTo(active[0]._view.x, active[0]._xScale.top);
        //     context.stroke();
        //   }
        // }
      },
      elements: {
        line: {
          // tension: 0
        }
      },
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
          ticks: {},
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
      vertical: {},
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
        // custom: (tooltipModel) => {
        //   console.log(tooltipModel);
        //   const _context = this.ctxt.nativeElement.getContext('2d');
        //         _context.beginPath();
        //         _context.moveTo(0, 0);
        //         _context.strokeStyle = '#ff0000';
        //         _context.lineTo(300, 100);
        //         _context.stroke();
        // },
        callbacks: {
          verticalLine: (x, y) => {
            console.log(x, y);
          },
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
          title: (tooltipItem, data) => {
            // console.log(tooltipItem);
            return;
          },
          footer: (tooltipItems, data) => {
            return 'active passes';
          }
        }
      }
    };
  }

  // onDevicesOrderChanged(event) {
  //   console.log(event);
  // }

  private drawChartXaxis() {
    let hour = 8;
    let _minute_iterator = 0;
    const _quater_hour = 15;
    while (hour < 16) {
      let minutes = _minute_iterator * _quater_hour;
      let time;
      if (_minute_iterator === 4) {
        _minute_iterator = 0;
        minutes = 0;
        hour++;
      }
      if ((hour) <= 12) {
        time = `${hour}:${minutes !== 0 ? minutes : minutes + '0'} ${hour < 12 ? 'AM' : 'PM'}`;
      } else {
        time = `${(hour - 12)}:${minutes !== 0 ? minutes : minutes + '0'} PM`;
      }
      _minute_iterator++;
      this.lineChartLabels.push(time);
    }
    // console.log(this.lineChartLabels);
    // this.lineChartLabels = this.lineChartLabels.slice(0, this.lineChartLabels.length - 1);

  }

  previewPDF() {

    const data = this.hallPassService.getActivePasses();


    data
      .do((hp_list: HallPass[]) => {
        this._zone.run(() => {
          this.numActivePasses = hp_list.length;
        });
      })
      .pipe(
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
        })
      )
      .subscribe((active_hp) => {
        if (active_hp.length) {
          this.pdf.generate(active_hp, 'p', 'dashboard');
        }
      });
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
      .subscribe((data) => {
          this.activeCalendar = false;
          console.log('82 Date ===> :', data.date);
          if (data.date) {
            if ( !this.chartsDate || (this.chartsDate && this.chartsDate.getTime() !== data.date.getTime()) ) {
              this.chartsDate = new Date(data.date);
              console.log(this.chartsDate);
              // this.getReports(this.chartsDate);
              this.adminService.getFilteredDashboardData(this.chartsDate)
                .subscribe((dashboard: any) => {
                  this.lineChartData = [{data: dashboard.hall_pass_usage}];
                });
            }
          }
        }
      );
  }

  ngOnDestroy() {
    this.shareChartData$.next();
    this.shareChartData$.complete();
  }

  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}
