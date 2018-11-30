import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../http-service';
import {HallPass} from '../../models/HallPass';
// import * as jsPDF from 'jspdf';
import {Router} from '@angular/router';
import {PdfGeneratorService} from '../pdf-generator.service';
import { Observable, Subject, of as ObservableOf} from 'rxjs';
import {map} from 'rxjs/operators';
import {switchMap} from 'rxjs/internal/operators';

// declare const jsPDF;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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
    private router: Router,
    private http: HttpService,
    private pdf: PdfGeneratorService,
  ) { }

  ngOnInit() {

    this.http.get('v1/hall_passes').subscribe((hp_list: Array<HallPass>) => {
      const diff = [];

      /* This is for e2e testing of page brake feature*/


      this.activeHallpasses = hp_list.slice(0, 90);

      /* When you will finish you can uncomment this block of code for really active hall passes */
                                          //     ||     //
                                          //     \/     //

        // this.activeHallpasses = hp_list.filter((hp) => {
        //   if( (new Date(hp.end_time).getTime() - new Date(hp.start_time).getTime()) > 0 ) {
        //     diff.push(new Date(hp.end_time).getTime() - new Date(hp.start_time).getTime());
        //   }
        //   return new Date(hp.expiration_time).getTime() > Date.now();
        // });


      console.log(this.activeHallpasses);
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

  previewPDF() {

    const data = ObservableOf(this.activeHallpasses);
        console.log(data)
        data
          .pipe(
            map((hp_list: HallPass[]) => {
              // console.log(hp_list);
              return hp_list.map(hp => {
               return {
                  'Student Name': hp.student.display_name,
                  'Origin': hp.origin.title,
                  'Destination': hp.destination.title,
                  'Travel Type': hp.destination.travel_types
                      .map((tt) => {
                        const _tt: any = tt
                                        .split('_')
                                        .map(chunk => chunk.slice(0, 1).toUpperCase()).join('');
                        return _tt;
                      })
                      .join(', '),
                };
              });
            })
          )
          .subscribe((active_hp) => {
            this.pdf.generate(active_hp, null, 'p', 'dashboard');
          });
          // .subscribe(console.log);
        // data.pipe(
        //   map(item => item.destination)
        // )
        // ;

    // this.pdf.generate(data);
  }
    // const doc = new jsPDF();
    //
    // const A4 = {
    //   height: 297,
    //   width: 210,
    // }
    //
    // const table = {
    //   top: 60,
    //   left: 10,
    //   lh: 16,
    //   sp: 47,
    //   col: 4,
    //   drawHeader: () => {
    //     doc.setFontStyle('bold');
    //     doc.text(table.left, table.top, 'Student Name' );
    //     doc.text(table.left + ( table.sp * 1), table.top, 'Student Name' );
    //     doc.text(table.left + ( table.sp * 2), table.top, 'Student Name' );
    //     doc.text(table.left + ( table.sp * 3), table.top, 'Student Name' );
    //   }
    // }
    // table.drawHeader();
    // // doc.setFontSize(24);
    // doc.text(60, 20, 'Active Hall Pass Report');
    //
    // // const doc = new jsPDF();
    // doc.setFontSize(24);
    // doc.text(60, 20, 'Active Hall Pass Report');
    // doc.line(10, 26, 200 , 26);
    // doc.setFontSize(12);
    // doc.text(10, 45, 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)');

  //   const doc = new jsPDF('p', 'pt');
  //
  //   const A4 = {
  //     height: 842,
  //     width: 595,
  //   }
  //
  //   const table = {
  //     top: 153,
  //     left: 29,
  //     right: 29,
  //     lh: 30,
  //     sp: 133,
  //     col: 11,
  //     drawHeader: () => {
  //
  //       doc.setFontSize(12);
  //       doc.setTextColor('#3D396B');
  //       doc.setFontStyle('bold');
  //
  //       doc.text(table.left + ( table.sp * 0), table.top - 6, "Student Name" );
  //       doc.text(table.left + ( table.sp * 1), table.top - 6, "Origin" );
  //       doc.text(table.left + ( table.sp * 2), table.top - 6, "Dastination" );
  //       doc.text(table.left + ( table.sp * 3), table.top - 6, "Travel Type" );
  //
  //       doc.setLineWidth(1.5);
  //       doc.line(table.left, table.top + 6, A4.width - table.right, table.top + 6);
  //       // doc.line(table.left, 87, A4.width - table.right, 87);
  //     },
  //     drawRow: (n) => {
  //       // 'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'
  //       doc.setFontSize(12);
  //       doc.setTextColor('#000000');
  //       doc.setFontStyle('normal');
  //
  //       doc.text(table.left + ( table.sp * 0), table.top + table.lh * n, "Hellen Keller" );
  //       doc.text(table.left + ( table.sp * 1), table.top + table.lh * n, "Washington" );
  //       doc.text(table.left + ( table.sp * 2), table.top + table.lh * n, "Nurse" );
  //       doc.text(table.left + ( table.sp * 3), table.top + table.lh * n, "OW" );
  //
  //       doc.setLineWidth(0.5);
  //       doc.line(table.left,  table.top + table.lh * n + 8, A4.width - table.right, table.top + table.lh * n + 8);
  //     },
  //   };
  //
  //
  //   doc.setFontSize(24);
  //   doc.text(170, 57, 'Active Hall Pass Report');
  //
  //   doc.line(table.left, 72, A4.width - table.right, 72);
  //
  //   doc.setFontSize(14);
  //   doc.text(table.left, 110, 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)');
  //   table.drawHeader();
  //   table.drawRow(1);
  //   table.drawRow(2);
  //   table.drawRow(3);
  //
  //
  //
  //
  //   const columns = [
  //     {title: 'Student Name', dataKey: 'student name'},
  //     {title: 'Origin', dataKey: 'origin'},
  //     {title: 'Destination', dataKey: 'destination'},
  //     {title: 'Travel Type', dataKey: 'travel type'},
  //   ];
  //
  //   const rows = [
  //     {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
  //     {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
  //     {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
  //     {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
  //     {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
  //   ];
  //
  //
  //   // doc.autoTable(columns, rows, {
  //   //   theme: 'striped',
  //   //   headerStyles: {
  //   //   },
  //   //   columnStyles: {
  //   //   },
  //   //   alternateRowStyles: {
  //   //   },
  //   //   margin: {top: 60, left: 10},
  //   //   addPageContent: function(data) {
  //   //   }
  //   // });
  //   // console.log(window.location.protocol, window.location.host);
  //
  //   const currentHost = `${window.location.protocol}//${window.location.host}`
  //
  //   window.open(`${currentHost}/pdf/${encodeURIComponent(doc.output('datauristring'))}`);
  // }

  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
}
