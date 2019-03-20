import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import {fromEvent, of, zip} from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { TimeService } from '../services/time.service';
import { DatePrettyHelper } from './date-pretty.helper';
import { LinkGeneratedDialogComponent } from './link-generated-dialog/link-generated-dialog.component';
import { OPEN_SANS_BOLD, OPEN_SANS_REGULAR } from './pdf-fonts';
import {StorageService} from '../services/storage.service';

declare const jsPDF;
declare const window;

@Injectable()
export class PdfGeneratorService {

  private LOGO_IMG: string;
  private REPORT_IMG: string;
  private A4: any;

  constructor(
    public httpService: HttpClient,
    private locationService: Location,
    private dialog: MatDialog,
    private storage: StorageService,
    private timeService: TimeService,
  ) {

  }

  private prepareBaseTemplate(orientation: string, ) {

    const _orientation = orientation === 'l' ? 'landscape' : 'portrait';

    return this.getAssests()
                .pipe(
                  tap((res) => {
                    this.LOGO_IMG = (res[0].srcElement as any).result;
                    this.REPORT_IMG = (res[1].srcElement as any).result;
                    this.A4 = this.setOrientationAndSize(_orientation);
                  }),
                  switchMap(() => {
                    const _doc = new jsPDF(_orientation, 'pt', [609.5, 792], {filters: ['ASCIIHexEncode']});
                          _doc.addFileToVFS('OpenSans-Regular.ttf', OPEN_SANS_REGULAR);
                          _doc.addFileToVFS('OpenSans-Bold.ttf', OPEN_SANS_BOLD);
                          _doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal');
                          _doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold');
                          _doc.setFont('OpenSans'); // set font
                    return of(_doc);
                  })
                );

  }

  private getAssests() {

    const logoPath = this.locationService.prepareExternalUrl('/assets/Arrow%20(Green).png');
    const reportPath = this.locationService.prepareExternalUrl('/assets/Report%20(Red).png');
    const imgLogo = new FileReader();
    const reportLogo = new FileReader();

    return zip(
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
    );
  }

  private drawLogo (doc: any) {

    doc.setFontSize(16);
    doc.setFontStyle('bold');
    doc.setTextColor('#33b94a');
    doc.text(29, this.A4.height - 21, 'SmartPass');
    doc.addImage(this.LOGO_IMG, 'PNG', 115, this.A4.height - 33, 15, 15);
    doc.setTextColor('#000000');
    doc.setFontSize(12);
    doc.setFontStyle('normal');

  }
  drawLink (doc) {
    const linkPlaceholder = 'View more information at smartpass.app/app';
    const link = 'https://smartpass.app/app';
    const linkRoundSpace = this.A4.width - (doc.getStringUnitWidth(linkPlaceholder) * 12);

    doc.setTextColor('#666666');
    doc.setFontSize(12);
    doc.setFontStyle('normal');

    doc.textWithLink(linkPlaceholder, linkRoundSpace / 2, this.A4.height - 21, {url: link});
  }

  private setOrientationAndSize (orientation: string) {
    return orientation === 'portrait'
                        ?
                {
                  height: 792,
                  width: 609.5,
                }
                        :
                {
                  height: 609.5,
                  width: 792,
                };
  }

  private drawDocHeader (doc, headerString: string) {
    doc.setFontSize(24);
    doc.setFontStyle('bold');

    const headerWidth = doc.getStringUnitWidth(headerString) * 24;
    const headerRoundSpace = this.A4.width - headerWidth;

    doc.text((headerRoundSpace / 2), 57, headerString);

    doc.line(29, 72, this.A4.width - 29, 72);
    doc.setFontSize(14);
  }

  generateProfileInstruction(role: string) {

    this
      .prepareBaseTemplate('p')
      .subscribe((res) => {
        const doc = res;
        this.drawDocHeader(doc, 'SmartPass Instructions');
        this.drawLogo(doc);

        doc.line(this.A4.width / 2, 72, this.A4.width / 2, 72 + 334);

        const teacherLeftSide = `<div style="color: #484747;">
                                <h3 style="color: #1f195e; margin-bottom: 10px; margin-top: 40px;">Rooms</h3>
                                <b>Assigned to:</b> Bathroom, Gym<br>Booker, Career Center
                               </div>
                              `;

        const studentLeftSide = `<div>
                                  <h4 style="color: #474747; margin-bottom: 10px; margin-top: 30px;">Acting on Behalf Of:</h4>
                                  <div style=" color: #474747;">Benneth Cole(bcol34)</div>
                                  <div style=" color: #474747;">Samuel Jenkins(sjer)</div>
                                 </div>
                                `


        const contentBoxLeft = `<div style="font-family: 'Open Sans', sans-serif;">
                                  <h3 style="color: #1F195E; margin-bottom: 10px; margin-top: 15px;">Account info</h3>
                                  <div style="color: #474747;">
                                    <b>Name: </b> Peter Luba<br><b>Account Type: </b> Alternative<br><b>Profile Type: </b> Student<br>
                                  </div>
                                  <h4 style="color: #474748; margin-bottom: 10px; margin-top: 30px;">Expiration</h4>
                                  <div style=" color: #484747;">Mar 3, 9:45AM</div>
                                  ${ role === '_profile_teacher' ? teacherLeftSide : role === '_profile_student' ? studentLeftSide : ''}
                                </div>`;

        doc.fromHTML(contentBoxLeft, 49, 94);

        const contentBoxRight = `<div style="font-family: 'Open Sans', sans-serif;">
                                  <h3 style="color: #1F195E; margin-bottom: 14px; margin-top: 15px;">Sign-in</h3>
                                  <div style="color: #474747">
                                    <div style="font-weight: bold;">Username: </div>
                                    <div style=" margin-top: 20px; margin-left: 12px;">pluba1</div>
                                  </div>
                                  <div style="color: #474847;">
                                    <div style="font-weight: bold; margin-top: 35px;">Password: </div>
                                    <div style="margin-top: 20px; margin-left: 12px;">gerkjb04</div>
                                  </div>
                                </div>
                                `;
        doc.setFillColor('#F7F7F7');

        doc.roundedRect(this.A4.width / 2 + 30, 152, 141, 27, 3, 3, 'F');
        doc.roundedRect(this.A4.width / 2 + 30, 218, 141, 27, 3, 3, 'F');

        doc.fromHTML(contentBoxRight, 335, 94);

        doc.setTextColor('#1F195E');
        doc.setFontSize(15);
        doc.setFontStyle('bold');
        doc.text(this.A4.width / 2 + 30, 255 + 41, 'Use “Alternative Sign-in,”');
        doc.text(this.A4.width / 2 + 30, 255 + 41 + 18, 'not Google Sign-in ');
        doc.setFontSize(14);
        doc.setFontStyle('normal');


        const isSafari = !!window.safari;

        const linkConsumer = (pdfLink) => {
          // Show the link to the user. The important part here is that the link is opened by the
          // user from an href attribute on an <a> tag or the new window is opened during a click event.
          // Most browsers will refuse to open a new tab/window if it is not opened during a user-triggered event.

          // One more marameter has been added to pass the raw data so that the user could download an Xlsx file from the dialog as well.
          LinkGeneratedDialogComponent.createDialog(this.dialog, 'Instruction Generated Successfully', pdfLink);
        };

        const blob = doc.output('blob', {filename: 'test'});
        // create a blob link for the PDF
        if (isSafari) {

          // Safari will not open URLs from createObjectURL() so this
          // hack with a FileReader is used instead.

          const reader = new FileReader();
          reader.onloadend = () => {
            linkConsumer(reader.result);
          };
          reader.readAsDataURL(blob);

        } else {
          linkConsumer(URL.createObjectURL(blob));
        }

      });

  }

  generateReport(data: any[], orientation: string = 'p', page: string = '', title?: string): void {

    const prettyNow = DatePrettyHelper.transform(this.timeService.nowDate());

    let heading = {
      header: 'Active Hall Pass Report',
      title: `All Active Hall Passes on ${prettyNow}`
    };

    switch (page) {
      case 'dashboard':
        heading = {
          header: 'Active Hall Pass Report',
          title: `All Active Hall Passes on ${prettyNow}`
        };
        break;
      case 'search' :

        heading = {
          header: 'Administrative Pass Report',
          title: title
        };
        break;
      case 'hallmonitor':
        heading = {
          header: 'Administrative Hall Monitor Report',
          title: ''
        };
        break;
    }

    const _headers: string[] = Object.keys(data.map ? data[0] : data);
    const _data: any[] = data;

    this
      .prepareBaseTemplate(orientation)
      .subscribe((res) => {
        console.log(this.A4);

        const doc = res;

        let pageCounter: number = 1;

        const table = {
          top: page === 'hallmonitor' ? 70 : 153,
          left: 29,
          right: 29,
          lh: 30,
          sp: Math.round((this.A4.width - (29 * 2)) / _headers.length),
          col: 11,

          drawPagination: (total) => {
            console.log(total);
            doc.setFontSize(14);
            doc.setTextColor('#333333');

            for (let pagePointer = 1; pagePointer <= total; pagePointer++) {
              console.log(pagePointer, `Page ${pagePointer} of ${total}`);

              const _pagination = `Page ${pagePointer} of ${total}`;

              doc.setPage(pagePointer);

              doc.text(this.A4.width - table.right - (doc.getStringUnitWidth(_pagination) * 14), this.A4.height - 21, _pagination);
            }

            doc.setFontSize(12);
            doc.setTextColor('#333333');
          },
          drawHeaders: (__headers: string[]) => {

            doc.setFontSize(12);
            doc.setTextColor('#3D396B');
            doc.setFontStyle('bold');

            __headers.forEach((header, n) => {
              if (n === 1) {
                doc.text(table.left + (table.sp * n) + 25, table.top - 6, header);
              } else {
                doc.text(table.left + (table.sp * n), table.top - 6, header);
              }
            });

            doc.setLineWidth(1.5);
            doc.line(table.left, table.top + 6, this.A4.width - table.right, table.top + 6);
          },
          drawRows: (__data) => {

            this.drawLogo(doc);
            this.drawLink(doc);

            doc.setLineWidth(0.5);
            doc.setFontSize(12);
            doc.setTextColor('#555555');
            doc.setFontStyle('normal');

            const ctx = this;

            function __internalIteration(d) {
              // const ctx = PdfGeneratorService.prototype;
              let breakLoop: boolean = false;
              let cell, n;
              if (d && d.length) {
                for (let j = 0; j < d.length; j++) {
                  cell = d[j];
                  n = j;
                  if ((table.top + table.lh * (n + 1)) < (ctx.A4.height - 50)) {
                    _headers.forEach((header, i) => {
                      if (i === 1) {
                        doc.text(table.left + (table.sp * i) + 25, table.top + table.lh * (n + 1), cell[_headers[i]]);
                      } else {
                        doc.text(table.left + (table.sp * i), table.top + table.lh * (n + 1), cell[_headers[i]]);
                      }
                    });
                    doc.line(table.left, table.top + table.lh * (n + 1) + 8, ctx.A4.width - table.right, table.top + table.lh * (n + 1) + 8);
                  } else {
                    doc.addPage();
                    table.top = 29;
                    doc.setPage(++pageCounter);
                    ctx.drawLogo(doc);
                    ctx.drawLink(doc);
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
            this.drawLogo(doc);
            this.drawLink(doc);
            doc.setTextColor('#000000');
            doc.setFontSize(14);
            doc.setFontStyle('bold');
            doc.text(table.left, table.top + table.lh * (1 + 1), __data.student_name);
            doc.setTextColor('#666666');
            const rightSpace = doc.getStringUnitWidth(__data.created) * 14;
            doc.text(this.A4.width - table.right - rightSpace, table.top + table.lh * (1 + 1), __data.created);
            doc.setFontSize(12);
            doc.text(table.left, table.top + table.lh * (2 + 1), `Reported by ${__data.issuer}:`);
            doc.setFontStyle('normal');
            doc.text(table.left, table.top + table.lh * (3 + 1) - 16, __data.message);
          }
        };


        this.drawDocHeader(doc, heading.header);
        // doc.setFontSize(24);
        // doc.setFontStyle('bold');
        //
        // const headerWidth = doc.getStringUnitWidth(heading.header) * 24;
        // const headerRoundSpace = this.A4.width - headerWidth;
        //
        // doc.text((headerRoundSpace / 2), 57, heading.header);
        //
        // doc.line(table.left, 72, this.A4.width - table.right, 72);
        // doc.setFontSize(14);

        if (heading.title && heading.title.length) {
          const titleStrings = doc.splitTextToSize(heading.title, this.A4.width - (29 * 4));
          titleStrings.forEach((str, i) => {
            doc.text(table.left, 110 - 5 + (i * 16), str);
          });
        }

        if (page === 'hallmonitor') {
          doc.addImage(this.REPORT_IMG, 'PNG', 55, 33, 30, 30);
          table.drawUnstructRows(_data);
        } else {
          table.drawHeaders(_headers);
          table.drawRows(_data);
        }
        table.drawPagination(pageCounter);

        const isSafari = !!window.safari;

        const linkConsumer = (pdfLink) => {
          // Show the link to the user. The important part here is that the link is opened by the
          // user from an href attribute on an <a> tag or the new window is opened during a click event.
          // Most browsers will refuse to open a new tab/window if it is not opened during a user-triggered event.

          // One more marameter has been added to pass the raw data so that the user could download an Xlsx file from the dialog as well.
          LinkGeneratedDialogComponent.createDialog(this.dialog, 'Report Generated Successfully', pdfLink, data);
        };

        const blob = doc.output('blob', {filename: 'test'});
        // create a blob link for the PDF
        if (isSafari) {

          // Safari will not open URLs from createObjectURL() so this
          // hack with a FileReader is used instead.

          const reader = new FileReader();
          reader.onloadend = () => {
            linkConsumer(reader.result);
          };
          reader.readAsDataURL(blob);

        } else {
          linkConsumer(URL.createObjectURL(blob));
        }

      });
  }
}
