import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { tap, switchMap } from 'rxjs/operators';
import {BehaviorSubject, fromEvent, zip} from 'rxjs';
import {environment} from '../../environments/environment';
import {DatePrettyHelper} from './date-pretty.helper';

declare const jsPDF;
declare const window;

@Injectable()
export class PdfGeneratorService {
  constructor(
    public httpService: HttpClient,
  ) { }

  generate(data: any[], redirectLink: HTMLAnchorElement, orientation: string = 'p', page: string = '', title?: string): void {

    window.localStorage.removeItem('pdf_src');

    const _redirectLink = redirectLink;
    const thisMoment = new Date();
    const prettyNow = DatePrettyHelper.transform(new Date());

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
          title: title
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
    const _headers: string[] = Object.keys(data.map ? data[0] : data );
    const _data: any[] = data;
    const doc = new jsPDF(_orientation, 'pt');
    const currentHost = `${window.location.protocol}//${window.location.host}${ environment.production ? '/app' : ''}`;
    const logoPath = `${currentHost}/assets/Arrow%20(Green).png`;
    const reportPath = `${currentHost}/assets/Report%20(Red).png`;
    const imgLogo = new FileReader();
    const reportLogo = new FileReader();
    let imgBase64Logo, imgBase64Report;

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
        imgBase64Logo = (res[0].srcElement as any).result;
        imgBase64Report = (res[1].srcElement as any).result;
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
            const linkPlaceholder = 'View more information at smartpass.app/app';
            const link = 'https://smartpass.app/app';
            const linkRoundSpace = A4.width - (doc.getStringUnitWidth(linkPlaceholder) * 12);

            doc.setTextColor('#666666');
            doc.setFontSize(12);
            doc.setFontStyle('normal');

            doc.textWithLink(linkPlaceholder, linkRoundSpace / 2, A4.height - 21,{ url: link });
          },
          drawPagination: (total) => {
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
          },
          drawRows: (__data) => {

            table.drawLogo();
            table.drawLink();

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
            doc.setTextColor('#000000');
            doc.setFontSize(14);
            doc.setFontStyle('bold');
            doc.text(table.left, table.top + table.lh * (1 + 1), __data.student_name);
            doc.setTextColor('#666666');
            const rightSpace = doc.getStringUnitWidth(__data.created) * 14;
            doc.text(A4.width - table.right - rightSpace, table.top + table.lh * (1 + 1), __data.created);
            doc.setFontSize(12);
            doc.setFontStyle('normal');
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
        (function() {
          const timer = 100;

          function _pdfRedirect(_timer) {
            setTimeout(() => {
              console.log(_redirectLink)
              if (window.localStorage.getItem('pdf_src')) {
                _redirectLink.click();
              } else {
                _pdfRedirect(_timer += timer * 2 );
              }
            }, _timer);
          }
          _pdfRedirect(timer);
        }());
        // window.open(`${currentHost}/pdf/report`);
      });
  }
}
