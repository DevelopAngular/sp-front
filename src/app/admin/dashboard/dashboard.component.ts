import { environment } from '../../../environments/environment';
import {Component, ElementRef, OnInit, ViewChild, NgZone} from '@angular/core';
import {HttpService} from '../../http-service';
import {HallPass} from '../../models/HallPass';
import {PdfGeneratorService} from '../pdf-generator.service';
import {of as ObservableOf, zip} from 'rxjs';
import {map} from 'rxjs/operators';
import {Report} from '../../models/Report';
import {LiveDataService} from '../../live-data/live-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  @ViewChild('printPdf') printPdf: ElementRef;
  @ViewChild('ctx') ctx: any;

  public lineChartData: Array<any> = [{data: Array.from(Array(24).keys()).map(() => 0)}];
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
  public numActivePasses = -1;
  public reports: Report[];
  public averagePassTime: number | string;
  public hiddenChart: boolean = true;

  constructor(
    private http: HttpService,
    private liveDataService: LiveDataService,
    private pdf: PdfGeneratorService,
    private _zone: NgZone
  ) {
  }

  ngOnInit() {

    const todayReports = this.liveDataService.getDateRange(new Date());
    let hour = 8;
    let _minute_iterator = 0;
    const _quater_hour = 15;
    while (hour < 14) {
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

    console.log(this.lineChartLabels);
    this.lineChartLabels = this.lineChartLabels.slice(0, this.lineChartLabels.length - 1);

    /*
    {"name":"Most Visited Locations","type":"list","rows":[{"name":"asd","value":"1736 passes"},{"name":"sdf","value":"1223 passes"},
    {"name":"Room","value":"796 passes"},{"name":"Nurse","value":"539 passes"},{"name":"Water","value":"528 passes"}]},
    {"name":"Average pass time","type":"single","value":"46.64 seconds"},{"name":"Active Pass Count","type":"single","value":0}
     */

    zip(
      this.http.get('v1/hall_passes/stats'),
      this.http.get(`v1/event_reports?created_before=${todayReports.end.toISOString()}&created_after=${todayReports.start.toISOString()}`),
      this.http.get('v1/admin/dashboard'),
    )
      .subscribe(([stats, eventReports, dashboard]: any[]) => {

        for (const entry of stats) {
          if (entry.name === 'Most Visited Locations') {
            this.passStatistic = entry['rows'];
          } else if (entry.name.toLowerCase() === 'average pass time') {
            this.averagePassTime = entry['value'];
          } else if (entry.name === 'Active Pass Count') {
            this.numActivePasses = entry['value'];
          }
        }

        // this.activeHallpasses = result[0].results;
        this.reports = eventReports;

        if (environment.funData) {
          this.lineChartData = [{data: dashboard.hall_pass_usage.map(numb => numb + Math.ceil((Math.random() * 25)))}];
        } else {
          this.lineChartData = [{data: dashboard.hall_pass_usage}];
        }

        this.hiddenChart = false;
        console.log(this.lineChartData[0].data);
        // this.reports = [];
      });

    this.gradient = this.ctx.nativeElement.getContext('2d').createLinearGradient(0, 380, 0, 0);
    this.gradient.addColorStop(0.5, 'rgba(0,207,49,0.01)');
    this.gradient.addColorStop(1, 'rgba(0,180, 118, 0.8)');
    this.lineChartColors = [
      {
        backgroundColor: this.gradient,
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
            suggestedMin: 0,
            stepSize: 5,
            suggestedMax: 35,

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
          ticks: {},
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
          labelColor: function (tooltipItem, chart) {
            return {
              borderColor: 'rgb(100, 0, 0)',
              backgroundColor: 'rgba(100, 0, 0, .4)'
            };
          },
          label: function (tooltipItems, data) {
            let _label = '' + tooltipItems.yLabel;
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

    const data = this.http.get('v1/hall_passes?active=true');


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
          this.pdf.generate(active_hp, null, 'p', 'dashboard');
        }
      });
  }

  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}
