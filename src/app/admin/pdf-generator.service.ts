import {Inject, Injectable} from '@angular/core';
import {AdminModule} from './admin.module';
import {HttpService} from '../http-service';
import {HttpClient} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import {fromEvent, Subject, Subscription} from 'rxjs';
import {mergeMap, switchMap} from 'rxjs/internal/operators';
import {encode} from 'punycode';
declare const jsPDF;
declare const window;

@Injectable(
)
export class PdfGeneratorService {

  private imageCast$: Subject<any> = new Subject<any>();

  constructor(
    public httpService: HttpClient
  ) { }

  generate(data: any[], headers?: string[], orientation: string = 'p', page: string = ''): void {
    let heading = {
      header: 'Active Hall Pass Report',
      title: 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)'
    };

    switch (page) {
      case('dashboard'): {
        heading = {
          header: 'Active Hall Pass Report',
          title: 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)'
        };
        break;
      }
      case('search'): {
        heading = {
          header: 'Administrative Pass Report',
          title: 'All Passes, Searching by Date & Time and Room Name: 8/7, 11:05 AM to 8/9, 1:43 PM; Gardner, Nurse as Both Origin and Destination'
        };
        break;
      }
      case('hallmonitor'): {
        heading = {
          header: 'Active Hall Pass Report',
          title: 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)'
        };
        break;
      }
    }

    // const heading = {
    //     header: 'Active Hall Pass Report',
    //     title: 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)'
    // };

    const _orientation = orientation === 'l' ? 'landscape' : 'portrait';

    const _headers: string[] = headers ||  Object.keys(data[0]);
    const _data: any[] = data;


    const doc = new jsPDF(_orientation, 'pt');
    const currentHost = `${window.location.protocol}//${window.location.host}`;
    const logoPath = `${currentHost}/assets/Arrow%20(Green).png`;
    let imgBase64;
    const img = new FileReader();

    let logoSub = new Subscription();
        logoSub = this.httpService
      .get(logoPath, {responseType: 'blob'})
      .pipe(
        tap((src) => {
          img.readAsDataURL(src);
        }),
        switchMap((blob) => {
          return fromEvent(img, 'load');
        })
      )
      .subscribe((res) => {
        // logoSub.unsubscribe();

        imgBase64 = (res.currentTarget as any).result;
        imgBase64 = encodeURIComponent(imgBase64)
        // console.log(imgBase64);
        const A4 = _orientation === 'portrait'
                                 ?
                            {
                              height: 842,
                              width: 595,
                            }
                                 :
                            {
                              height: 595,
                              width: 842,
                            }
        let page: number = 1;

        const table = {
          top: 153,
          left: 29,
          right: 29,
          lh: 30,
          // sp: 133,
          sp: Math.round((A4.width - (29 * 2) ) / _headers.length),
          col: 11,
          drawLogo: () => {
            doc.setFontSize(18);
            doc.setTextColor('#009900');
            doc.text(29, A4.height - 10, 'SmartPass')
            // doc.addImage(imgBase64, 'JPEG', 55, A4.height - 10, 25, 25);


            doc.setTextColor('#000000');
            doc.setFontSize(12);
          },
          drawHeaders: (__headers: string[]) => {

            doc.setFontSize(12);
            doc.setTextColor('#3D396B');
            doc.setFontStyle('bold');

            __headers.forEach((header, n) => {
              doc.text(table.left + ( table.sp * n), table.top - 6, header );
            });

            doc.setLineWidth(1.5);
            doc.line(table.left, table.top + 6, A4.width - table.right, table.top + 6);
            // doc.line(table.left, 87, A4.width - table.right, 87);
          },
          drawRows: (__data) => {

            doc.setLineWidth(0.5);
            doc.setFontSize(12);
            doc.setTextColor('#555555');
            doc.setFontStyle('normal');

            table.drawLogo();

            function __internalIteration(d) {
              let breakLoop: boolean = false;
              let cell, n;
              if (d && d.length) {
                for (let j = 0; j < d.length; j++) {
                  cell = d[j];
                  n = j;
                  if (( table.top + table.lh * (n + 1)) < (A4.height - 50) ) {
                    _headers.forEach((header, i) => {
                      doc.text(table.left + ( table.sp * i), table.top + table.lh * (n + 1), cell[_headers[i]]);
                    });
                    doc.line(table.left,  table.top + table.lh * (n + 1) + 8, A4.width - table.right, table.top + table.lh * (n + 1) + 8);
                  } else {
                    doc.addPage();
                    table.top = 29;
                    doc.setPage(++page);
                    table.drawLogo();
                    breakLoop = true;
                    break;
                  }
                }
              }
              if (breakLoop) {
                __internalIteration(d.slice(n));
              } else {
                return;
              }
            }
            __internalIteration(__data);
          }
        };
        console.log(table.sp)
        doc.setFontSize(24);

        const headerWidth = doc.getStringUnitWidth(heading.header) * 24;
          console.log(headerWidth);
        const headerRoundSpace = A4.width - headerWidth;
        doc.text((headerRoundSpace / 2), 57, heading.header);

        doc.line(table.left, 72, A4.width - table.right, 72);

        doc.setFontSize(14);
        // doc.text(table.left, 110, 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)');
        const titleStrings = doc.splitTextToSize(heading.title, A4.width - (29 * 4));
              titleStrings.forEach((str, i) => {
                doc.text(table.left, 110 - 5 + (i * 16), str);
              })
        table.drawHeaders(_headers);
        table.drawRows(_data);



        window.open(`${currentHost}/pdf/${encodeURIComponent(doc.output('datauristring'))}`);
      });
  }
}
