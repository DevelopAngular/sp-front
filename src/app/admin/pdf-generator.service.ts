import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import {forkJoin, fromEvent, Subject, Subscription, zip} from 'rxjs';
import {switchMap} from 'rxjs/internal/operators';
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

    const thisMoment = new Date();
    const time = thisMoment.getHours() < 12
                          ?
                `${thisMoment.getHours()}:${thisMoment.getMinutes()} AM`
                          :
                `${thisMoment.getHours() - 12}:${thisMoment.getMinutes()} PM`;
    const prettyNow = `${thisMoment.getMonth()}:${thisMoment.getDate()}:${thisMoment.getFullYear()} at ${time}`;

    let heading = {
      header: 'Active Hall Pass Report',
      title: `All Active Hall Passes on ${prettyNow}`
    };

    switch (page) {
      case('dashboard'): {
        heading = {
          header: 'Active Hall Pass Report',
          title: `All Active Hall Passes on ${prettyNow}`
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
          header: 'Administrative Hall Monitor Report',
          title: ''
        };
        break;
      }
    }

    const _orientation = orientation === 'l' ? 'landscape' : 'portrait';

    const _headers: string[] = headers ||  Object.keys(data[0]);
    const _data: any[] = data;


    const doc = new jsPDF(_orientation, 'pt');
    const currentHost = `${window.location.protocol}//${window.location.host}`;
    const logoPath = `${currentHost}/assets/Arrow%20(Green).png`;
    const reportPath = `${currentHost}/assets/Report%20(Red).png`;
    const imgLogo = new FileReader();
    const reportLogo = new FileReader();
    let imgBase64Logo, imgBase64Report;

    // let logoSub = new Subscription();
    zip(
      this.httpService
        .get(logoPath, {responseType: 'blob'})
        .pipe(
          tap((src) => {
            imgLogo.readAsDataURL(src);
          }),
          switchMap((blob) => {
            return fromEvent(imgLogo, 'load');
          }),
        ),
      this.httpService
        .get(reportPath, {responseType: 'blob'})
        .pipe(
          tap((src) => {
            reportLogo.readAsDataURL(src);
          }),
          switchMap((blob) => {
            return fromEvent(reportLogo, 'load');
          }),
        )
    ).subscribe((res) => {
        console.log(res);
        imgBase64Logo = (res[0].currentTarget as any).result;
        imgBase64Report = (res[1].currentTarget as any).result;
      //
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
        let pageCounter: number = 1;

        const table = {
          top: page === 'hallmonitor' ? 70 : 153,
          left: 29,
          right: 29,
          lh: 30,
          sp: Math.round((A4.width - (29 * 2) ) / _headers.length),
          col: 11,
          drawLink: () => {
            //  View more information at smartpass.app/app
            const linkPlaceholder = 'View more information at smartpass.app/app';
            const link = 'https://smartpass.app/app';
            const linkRoundSpace = A4.width - (doc.getStringUnitWidth(linkPlaceholder) * 12);

            doc.setTextColor('#666666');
            doc.setFontSize(12);
            doc.setFontStyle('normal');

            doc.textWithLink(linkPlaceholder, linkRoundSpace / 2, A4.height - 21,{ url: link });
          },
          drawPagination: (total) => {
            // doc.setPage(1);
            console.log(total);
            doc.setFontSize(14);
            doc.setTextColor('#333333');

            for (let pagePointer = 1; pagePointer <= total; pagePointer++) {
              console.log(pagePointer, `Page ${pagePointer} of ${total}`);

              const _pagination = `Page ${pagePointer} of ${total}`;

              doc.setPage(pagePointer);

              doc.text(A4.width - table.right - (doc.getStringUnitWidth(_pagination) * 14) , A4.height - 21, _pagination);
            }

            doc.setFontSize(12);
            doc.setTextColor('#333333');
          },
          drawLogo: () => {

            doc.setFontSize(16);
            doc.setFontStyle('bold');
            doc.setTextColor('#33b94a');
            doc.text(table.left, A4.height - 21, 'SmartPass');
            doc.addImage(imgBase64Logo, 'PNG', 115, A4.height - 33, 15, 15);
            doc.setTextColor('#000000');
            doc.setFontSize(12);
            doc.setFontStyle('normal');

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

            table.drawLogo();
            table.drawLink();
            // table.drawPagination(pageCounter);

            doc.setLineWidth(0.5);
            doc.setFontSize(12);
            doc.setTextColor('#555555');
            doc.setFontStyle('normal');

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
                    doc.setPage(++pageCounter);
                    table.drawLogo();
                    table.drawLink();
                    // table.drawPagination(pageCounter);
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
          },
          drawUnstructRows: (__data) => {
            table.drawLogo();
            table.drawLink()
            doc.setFontSize(14);
            doc.text(table.left, table.top + table.lh * (1 + 1), __data.student_name);
            doc.setTextColor('#666666');
            doc.text(A4.width - 150, table.top + table.lh * (1 + 1), __data.created);
            doc.setFontSize(12);
            doc.text(table.left, table.top + table.lh * (2 + 1), `Reported by ${__data.issuer}:`);
            doc.text(table.left, table.top + table.lh * (3 + 1) - 16, __data.message);
          }
        };

        doc.setFontSize(24);

        const headerWidth = doc.getStringUnitWidth(heading.header) * 24;
        const headerRoundSpace = A4.width - headerWidth;

        doc.text((headerRoundSpace / 2), 57, heading.header);

        doc.line(table.left, 72, A4.width - table.right, 72);
        doc.setFontSize(14);
        if (heading.title && heading.title.length) {
          const titleStrings = doc.splitTextToSize(heading.title, A4.width - (29 * 4));
          titleStrings.forEach((str, i) => {
            doc.text(table.left, 110 - 5 + (i * 16), str);
          });
        }

        if (page === 'hallmonitor') {
          doc.addImage(imgBase64Report, 'PNG', 65, 33, 30, 30);
          table.drawUnstructRows(_data);
        } else {
          table.drawHeaders(_headers);
          table.drawRows(_data);
        }
        table.drawPagination(pageCounter);

        window.localStorage.setItem('pdf_src', `${encodeURIComponent(doc.output('datauristring'))}`);

        window.open(`${currentHost}/pdf/report`);
        // window.open(`${currentHost}/pdf/${encodeURIComponent(imgBase64Logo)}`);
        // window.open(`${currentHost}/pdf/${encodeURIComponent(doc.output('datauristring'))}`);
        // window.open(doc.output('datauristring'));
        // doc.output('datauri');
      });
  }
}
