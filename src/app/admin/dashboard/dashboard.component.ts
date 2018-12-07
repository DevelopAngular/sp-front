import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../http-service';
import {HallPass} from '../../models/HallPass';
import {PdfGeneratorService} from '../pdf-generator.service';
import {Observable, Subject, of as ObservableOf, zip, BehaviorSubject, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {Report} from '../../models/Report';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  @ViewChild('ctx') ctx: any;

  public lineChartData: Array<any> = [ {data: Array.from(Array(24).keys()).map(() => 0)} ];
  // = [
  //   { data: [5, 14, 9, 12, 11, 10, 15, 5] },
  // ];

  public lineChartLabels: Array<any> = Array.from(Array(24).keys()).map(hour => hour + (hour < 12 ? 'AM' : 'PM'));
    // ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'];
  public lineChartOptions: any;
  public gradient: any;

  public lineChartColors: Array<any>;
  public lineChartLegend: boolean = false;
  public lineChartType: string = 'line';
  public passStatistic: any;
  public activeHallpasses: HallPass[];
  public reports: Report[];
  public averagePassTime: number|string;
  public hiddenChart: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private http: HttpService,
    private pdf: PdfGeneratorService,
  ) { }

  ngOnInit() {

    zip(
      this.http.get('v1/hall_passes?limit=100&sort=created'),
      this.http.get('v1/hall_passes/stats'),
      this.http.get('v1/hall_passes?active=true'),
      this.http.get('v1/event_reports'),
      this.http.get('v1/admin/dashboard'),
    )
    .subscribe((result: any[]) => {
      this.passStatistic = result[1][0]['rows'];
      this.averagePassTime = result[1][1]['value'];
      this.activeHallpasses = result[2];
      // this.activeHallpasses = result[0].results;
      this.reports =  result[3];
      this.lineChartData = [{ data: result[4].hall_pass_usage.map(numb => numb + (Math.random() * 25))}];
      // this.reports = [];
    });

      this.gradient = this.ctx.nativeElement.getContext('2d').createLinearGradient(0, 380, 0, 0);
      this.gradient.addColorStop(0.5, 'rgba(0,207,49,0.01)');
      this.gradient.addColorStop(1, 'rgba(0,180, 118, 0.8)');
      this.lineChartColors = [
        {
          backgroundColor:  this.gradient,
          borderColor: 'rgba(0,159,0,1)',
          pointBackgroundColor: 'rgba(148,159,177,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
      ];
      this.lineChartOptions = {
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin: 5,
              suggestedMax: 16,
            },
            gridLines: {
              display: true,
              borderDash: [10, 10]
            },
            scaleLabel: {
              display: true,
              fontColor: 'black',
              fontSize: 16,
              labelString: 'Number of active passes',
              padding: 20
            }
          }],
          xAxes: [{
            ticks: {

            },
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true,
              fontColor: 'black',
              fontSize: 16,
              labelString: 'Time',
              padding: 10,
            },
          }]
        },
        tooltips: {
          displayColors: false,
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0, 0, 0, .1)',
          borderWidth: 1,
          bodyFontColor: '#333333',
          footerFontColor: '#333333',
          bodyFontSize: 18,
          footerFontStyle: 'normal',
          callbacks: {
            labelColor: function(tooltipItem, chart) {
              return {
                borderColor: 'rgb(100, 0, 0)',
                backgroundColor: 'rgba(100, 0, 0, .4)'
              };
            },
            label: function(tooltipItems, data) {
              let _label = new String(tooltipItems.yLabel)
              _label = _label.padStart(7, ' ');
              return _label;
            },
            title: (tooltipItem, data) => {
              return;
            },
            footer: (tooltipItems, data) => {
              return 'active passes';
            }
          }
        }
      };
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
              this.pdf.generate(active_hp, null, 'p', 'dashboard');
            }
          });
  }

  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
}
