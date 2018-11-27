import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../http-service';
import {HallPass} from '../../models/HallPass';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('ctx') ctx: any;

  public lineChartData: Array<any> = [
    { data: [5, 14, 9, 12, 11, 10, 15, 5] },
  ];

  public lineChartLabels: Array<any> = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'];
  public lineChartOptions: any;
  public gradient: any;

  public lineChartColors: Array<any>
  public lineChartLegend: boolean = false;
  public lineChartType: string = 'line';
  public activeHallpasses: any[];
  public averagePassTime: number|string;

  constructor(
    private http: HttpService,
  ) { }
  ngOnInit() {

    this.http.get('v1/hall_passes').subscribe((hp_list: Array<HallPass>) => {
      const diff = [];

      this.activeHallpasses = hp_list.filter((hp) => {
        if( (new Date(hp.end_time).getTime() - new Date(hp.start_time).getTime()) > 0 ) {
          diff.push(new Date(hp.end_time).getTime() - new Date(hp.start_time).getTime());
        }
        return new Date(hp.expiration_time).getTime() > Date.now();
      });
       let time = 0;
       for(let i = 0; i < diff.length; i++) {
         time += diff[i];
       }
       this.averagePassTime = (time / diff.length / 60000).toFixed(2);
    })


    this.gradient = this.ctx.nativeElement.getContext('2d').createLinearGradient(0, 380, 0, 0);
    this.gradient.addColorStop(0.5, 'rgba(0,207,49,0.01)');
    this.gradient.addColorStop(1, 'rgba(0,180, 118, 0.8)');
    this.lineChartOptions = {
      responsive: true,
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
        }],
      },
    };
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

  }

  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
}
