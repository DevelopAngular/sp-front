import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../http-service';
import {HallPass} from '../../models/HallPass';
import {PdfGeneratorService} from '../pdf-generator.service';
import {interval, of as ObservableOf, Subject, zip} from 'rxjs';
import {map} from 'rxjs/operators';
import {Report} from '../../models/Report';
import {LiveDataService} from '../../live-data/live-data.service';
import {switchMap, takeUntil} from 'rxjs/internal/operators';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild('printPdf') printPdf: ElementRef;
  @ViewChild('ctx') ctx: any;
  @ViewChild('ctxt') ctxt: any;
  private shareChartData$: Subject<any> = new Subject();
  public lineChartData: Array<any> = [ {data: Array.from(Array(24).keys()).map(() => 0)} ];
  // public lineChartData: Array<any> = [ {data: []} ];
  // = [
  //   { data: [5, 14, 9, 12, 11, 10, 15, 5] },
  // ];

  public lineChartLabels: Array<any> = [];
    // Array.from(Array(24).keys()).map(hour =>


  public lineChartOptions: any;
  public gradient: any;
  public lineChartColors: Array<any>;
  public lineChartLegend: boolean = false;
  public lineChartType: string = 'line';
  public passStatistic: any;
  public activeHallpasses: HallPass[];
  public reports: Report[];
  public averagePassTime: number|string;
  public hiddenChart: boolean = true;

  public lineChartTicks: any =  {
    suggestedMin: 0,
    stepSize: 5,
  };

  constructor(
    private http: HttpService,
    private liveDataService: LiveDataService,
    private pdf: PdfGeneratorService,
  ) { }

  ngOnInit() {

    this.drawChartXaxis();

    const todayReports = this.liveDataService.getDateRange(new Date());

    zip(
      this.http.get('v1/hall_passes?limit=100&sort=created'),
      this.http.get('v1/hall_passes/stats'),
      this.http.get('v1/hall_passes?active=true'),
      // this.http.get('v1/event_reports'),
      this.http.get(`v1/event_reports?created_before=${todayReports.end.toISOString()}&created_after=${todayReports.start.toISOString()}`),
      this.http.get('v1/admin/dashboard'),
    )
    .subscribe((result: any[]) => {
      this.passStatistic = result[1][0]['rows'];
      this.averagePassTime = result[1][1]['value'];
      this.activeHallpasses = result[2];
      // this.activeHallpasses = result[0].results;
      this.reports =  result[3];
      this.lineChartData = [{ data: result[4].hall_pass_usage.map(numb => numb + Math.ceil((Math.random() * Math.random() * 30)))}];
      // this.lineChartData = [{ data: result[4].hall_pass_usage}];
      this.hiddenChart = false;
      delete this.lineChartTicks.suggestedMax;

    });
    interval(60000)
      .pipe(
        switchMap(() => this.http.get('v1/admin/dashboard')),
        takeUntil(this.shareChartData$)
      )
      .subscribe((result: any) => {
        this.lineChartData = [{
          data: result.hall_pass_usage.map(numb => numb + Math.ceil((Math.random() * Math.random() * 30)))
        }];
      });

      this.gradient = this.ctx.nativeElement.getContext('2d').createLinearGradient(0, 380, 0, 0);
      this.gradient.addColorStop(0.5, 'rgba(0,207,49,0.01)');
      this.gradient.addColorStop(1, 'rgba(0,180, 118, 0.8)');
      this.lineChartColors = [
        {
          backgroundColor:  this.gradient,
          pointBackgroundColor: 'transparent',
          borderColor: 'rgba(0,159,0,1)',
          // pointHoverBackgroundColor: 'rgba(148,159,177,1)',
          pointHoverBackgroundColor: '#FFFFFF',
          pointBorderColor: 'transparent',
          pointBorderWidth: 3,
          pointHoverRadius: 6,
          // steppedLine: true,
          // snapGaps: true,
          // showLine: false,
          // pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#134482'
        }
      ];
      this.lineChartOptions = {
        hover: {
          onHover: (event, active) => {
            if (active && active.length) {
              console.log(active);
              const context = this.ctx.nativeElement.getContext('2d');
              context.beginPath();
              context.moveTo(active[0]._view.x, active[0]._view.y + 5);
              context.strokeStyle = '#134482';
              context.lineWidth = 2;
              context.lineTo(active[0]._view.x, active[0]._xScale.top);
              context.stroke();
            }
          }
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
            ticks: {

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
        vertical: {

        },
        tooltips: {
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
              let _label = new String(tooltipItems.yLabel)
              _label = _label.padStart(7, ' ');
              return _label;
            },
            title: (tooltipItem, data) => {
              console.log(tooltipItem);
              return;
            },
            footer: (tooltipItems, data) => {
              return 'active passes';
            }
          }
        }
      };
  }

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
      if ( (hour) <= 12 ) {
        time = `${hour}:${minutes !== 0 ? minutes : minutes + '0'} ${ hour < 12 ? 'AM' : 'PM' }`;
      } else {
        time = `${(hour - 12)}:${minutes !== 0 ? minutes : minutes + '0'} PM`;
      }
      _minute_iterator++;
      this.lineChartLabels.push(time);
    };
    // console.log(this.lineChartLabels);
    this.lineChartLabels = this.lineChartLabels.slice(0, this.lineChartLabels.length - 1);

  }

  previewPDF() {

    const data = ObservableOf(this.activeHallpasses);
        data
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
              this.pdf.generate(active_hp, this.printPdf.nativeElement, 'p', 'dashboard');
            }
          });
  }

  ngOnDestroy() {
    this.shareChartData$.next();
    this.shareChartData$.complete();
  }
  public chartClicked(e:any):void {
    console.log(e);
    // const context = this.ctx.nativeElement.getContext('2d');
    // console.log(Chart.Tooltip);
    // context.beginPath();
    // context.moveTo(0, 0);
    // context.strokeStyle = '#ff0000';
    // context.lineTo(300, 100);
    // // context.lineTo(point.x, scale.endPoint);
    // context.stroke();
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
}
