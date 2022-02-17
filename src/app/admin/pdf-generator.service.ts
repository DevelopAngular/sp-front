import {Location} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {fromEvent, Observable, of, zip} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {TimeService} from '../services/time.service';
import {LinkGeneratedDialogComponent} from './link-generated-dialog/link-generated-dialog.component';
import {OPEN_SANS_BOLD, OPEN_SANS_REGULAR} from './pdf-fonts';
import {StorageService} from '../services/storage.service';
import {prettyDate} from './helpers';
import * as moment from 'moment';

declare const jsPDF;
declare const window;


  export const SP_ARROW_BLUE_GRAY = `<svg width="15px" height="15px" viewBox="0 0 160 140">
                                      <title>SP Arrow (Blue-Gray)</title>
                                      <desc>Created with Sketch.</desc>
                                      <g id="SP-Arrow-(Blue-Gray)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <g id="Logo" transform="translate(3.000000, 0.000000)" fill="#7F879D" fill-rule="nonzero">
                                          <path d="M127.685045,98.1464997 L80.6403711,145.191173 C74.2538542,151.57769 63.9281157,151.606542 57.5771895,145.255616 C51.226263,138.904689 51.2551148,128.578951 57.6416316,122.192434 L104.686305,75.1477605 L57.3461108,27.8075658 C50.9595937,21.4210488 50.9307419,11.0953107 57.2816684,4.74438419 C63.6325949,-1.60654219 73.9583331,-1.57769053 80.34485,4.80882648 L139.415225,63.8792012 C145.703488,70.1674642 145.731895,80.3343446 139.478676,86.5875648 L127.802392,98.2638476 L127.685045,98.1464997 Z M51.229003,99.7185895 L27.7048949,123.242698 C21.3326816,129.614911 11.0584973,129.672126 4.7568622,123.370491 C-1.54477286,117.068856 -1.48755764,106.794672 4.88465572,100.422458 L28.4087639,76.8983503 L4.81684319,53.3064295 C-1.55537032,46.934216 -1.61258544,36.6600316 4.68904964,30.3583967 C10.9906847,24.0567616 21.2648689,24.1139768 27.6370822,30.4861904 L62.7366843,65.5857925 C69.0108639,71.859972 69.0671988,81.9760916 62.862512,88.1807786 L51.2768521,99.7664383 L51.229003,99.7185895 Z" id="Arrow"></path>
                                        </g>
                                      </g>
                                    </svg>`;
  export const SP_ARROW_DOUBLE_BLUE_GRAY = `<svg width="23px" height="11px" viewBox="0 50 150 50">
                                              <title>SP Arrow Double (Blue-Gray)</title>
                                              <desc>Created with Sketch.</desc>
                                              <g id="SP-Arrow-Double-(Blue-Gray)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g id="Logo" transform="translate(88.000000, 43.000000)" fill="#7F879D" fill-rule="nonzero">
                                                  <path d="M54.9182725,41.8758399 L34.6840139,61.948234 C31.9371262,64.6731479 27.4959505,64.685458 24.7643707,61.9757295 C22.0327907,59.2660009 22.0452001,54.8603525 24.7920877,52.1354387 L45.0263463,32.0630445 L24.6649821,11.8645614 C21.9180943,9.1396475 21.9056849,4.73399923 24.6372649,2.02427059 C27.3688449,-0.685458001 31.8100205,-0.673147961 34.5569081,2.05176596 L59.9635087,27.2551259 C62.6681366,29.9381181 62.680355,34.275987 59.9907994,36.9440276 L54.9687445,41.9259083 L54.9182725,41.8758399 Z M22.0339692,42.5465982 L11.9160781,52.583551 C9.1753425,55.302362 4.75634063,55.3267739 2.04596125,52.6380763 C-0.664418119,49.9493786 -0.639809431,45.5657266 2.10092618,42.8469156 L12.2188173,32.8099628 L2.07175952,22.7440766 C-0.668976163,20.0252655 -0.693584805,15.6416135 2.01679457,12.9529159 C4.72717394,10.2642183 9.14617576,10.2886301 11.8869114,13.0074412 L26.9835072,27.9832715 C29.6820777,30.6602547 29.7063078,34.9764657 27.0376266,37.6237989 L22.0545494,42.5670137 L22.0339692,42.5465982 Z" id="Arrow"></path>
                                                </g>
                                                <g id="Logo" transform="translate(31.000000, 75.000000) scale(-1, 1) translate(-31.000000, -75.000000) translate(0.000000, 43.000000)" fill="#7F879D" fill-rule="nonzero">
                                                  <path d="M54.9182725,41.8758399 L34.6840139,61.948234 C31.9371262,64.6731479 27.4959505,64.685458 24.7643707,61.9757295 C22.0327907,59.2660009 22.0452001,54.8603525 24.7920877,52.1354387 L45.0263463,32.0630445 L24.6649821,11.8645614 C21.9180943,9.1396475 21.9056849,4.73399923 24.6372649,2.02427059 C27.3688449,-0.685458001 31.8100205,-0.673147961 34.5569081,2.05176596 L59.9635087,27.2551259 C62.6681366,29.9381181 62.680355,34.275987 59.9907994,36.9440276 L54.9687445,41.9259083 L54.9182725,41.8758399 Z M22.0339692,42.5465982 L11.9160781,52.583551 C9.1753425,55.302362 4.75634063,55.3267739 2.04596125,52.6380763 C-0.664418119,49.9493786 -0.639809431,45.5657266 2.10092618,42.8469156 L12.2188173,32.8099628 L2.07175952,22.7440766 C-0.668976163,20.0252655 -0.693584805,15.6416135 2.01679457,12.9529159 C4.72717394,10.2642183 9.14617576,10.2886301 11.8869114,13.0074412 L26.9835072,27.9832715 C29.6820777,30.6602547 29.7063078,34.9764657 27.0376266,37.6237989 L22.0545494,42.5670137 L22.0339692,42.5465982 Z" id="Arrow"></path>
                                                </g>
                                              </g>
                                            </svg>`;

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  private LOGO_IMG: string;
  private REPORT_IMG: string;
  private ARROW_IMG: string;
  private ARROW_DOUBLE_IMG: string;
  private A4: any;

  public pdfUrl: string;

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
                    this.ARROW_IMG = (res[2].srcElement as any).result;
                    this.ARROW_DOUBLE_IMG = (res[3].srcElement as any).result;

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

    const logoPath = this.locationService.prepareExternalUrl('/assets/Legacy/Arrow%20(Green).png');
    const reportPath = this.locationService.prepareExternalUrl('/assets/Legacy/Report%20(Red).png');
    const ArrowPath = this.locationService.prepareExternalUrl('/assets/Legacy/SP%20Arrow%20(Blue-Gray).png');
    const ArrowDoublePath = this.locationService.prepareExternalUrl('/assets/Legacy/SP%20Arrow%20Double%20(Blue-Gray).png');
    const imgLogo = new FileReader();
    const reportLogo = new FileReader();
    const Arrow = new FileReader();
    const ArrowDouble = new FileReader();

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
        ),
      this.httpService
        .get(ArrowPath, {responseType: 'blob'})
        .pipe(
          tap((src) => {
            Arrow.readAsDataURL(src);
          }),
          switchMap((blob) => {
            return fromEvent(Arrow, 'load');
          }),
        ),
      this.httpService
        .get(ArrowDoublePath, {responseType: 'blob'})
        .pipe(
          tap((src) => {
            ArrowDouble.readAsDataURL(src);
          }),
          switchMap((blob) => {
            return fromEvent(ArrowDouble, 'load');
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

  generateReport(data: any, orientation: string = 'p', page: string = '', title?: string): Observable<any> {

    const prettyNow = prettyDate(this.timeService.nowDate());

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
      case 'explore':
        heading = {
          header: 'SmartPass Report',
          title: ''
        };
        break;
    }

    const _headers: string[] = Object.keys(data.map ? data[0] : data);
    const _data: any[] = data;

    return this
      .prepareBaseTemplate(orientation)
      .pipe(
        tap((res) => {
          // console.log(this.A4);

          const doc = res;
          if (page === 'explore') {
            doc.setProperties({
              title: `Smartpass Support - ${moment(data.date).format('DD / hh:mm A')}`,
            });
            doc.viewerPreferences({'DisplayDocTitle': true});
          }


          let pageCounter: number = 1;

          const table = {
            top: page === 'explore' ? 70 : 153,
            left: 29,
            right: 29,
            lh: 35,
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
              doc.setTextColor('#1F194E');
              doc.setFontStyle('bold');

              __headers.forEach((header, n) => {
                if (n === 1) {
                  doc.text(table.left + (table.sp * n) + 55, table.top - 6, header);
                } else if (n === 2) {
                  doc.text(table.left + (table.sp * n) + 45, table.top - 6, header);
                } else {
                  doc.text(table.left + (table.sp * n), table.top - 6, header);
                }
              });

              doc.setLineWidth(1.5);
              doc.line(table.left, table.top + 6, this.A4.width - table.right, table.top + 6);
            },
            drawCellWithImg: (imgCell, headerIndex, rowIndex ) => {
              const cell = imgCell;
              const i = headerIndex;
              const n = rowIndex;

              if (cell['TT'] === 'OW') {
                doc.addImage(this.ARROW_IMG, 'PNG', table.left + (table.sp * i) + 45, table.top - 14 + table.lh * (n + 1) - 3, 15, 15);
              } else {
                doc.addImage(this.ARROW_DOUBLE_IMG, 'PNG', table.left + (table.sp * i) + 45, table.top - 11 + table.lh * (n + 1) - 3, 23, 11);
              }
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

                let breakLoop: boolean = false;
                let cell, n;
                if (d && d.length) {
                  for (let j = 0; j < d.length; j++) {
                    cell = d[j];
                    n = j;
                    if ((table.top + table.lh * (n + 1)) < (ctx.A4.height - 50)) {
                      _headers.forEach((header, i) => {
                        if (i === 1) {
                          if (header === 'TT') {
                            table.drawCellWithImg(cell, i, n);
                          } else {
                            doc.text(table.left + (table.sp * i) + 55, table.top + table.lh * (n + 1) - 5, cell[_headers[i]]);
                          }
                        } else {
                          if (header === 'TT') {
                            table.drawCellWithImg(cell, i, n);
                          } else {
                            try {
                              if (header === 'Student Name' && cell['Student Name'].length > 28) {
                                const rowTextArray = cell[_headers[i]].split(' (');
                                const rowText = [rowTextArray[0], '(' + rowTextArray[1]];
                                doc.text(table.left + (table.sp * i), table.top + table.lh * (n + 1) - 13, rowText);
                              } else {
                                doc.text(table.left + (table.sp * i), table.top + table.lh * (n + 1) - 5, cell[_headers[i]]);
                              }
                            } catch (e) {
                              console.log(e);
                              doc.text(table.left + (table.sp * i), table.top + table.lh * (n + 1), 'error');
                            }
                          }
                        }
                      });
                      doc.line(table.left, (table.top + table.lh * (n + 1)) + 8, ctx.A4.width - table.right, table.top + table.lh * (n + 1) + 8);
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
              doc.text(table.left, table.top + table.lh * (3 + 1) - 16, doc.splitTextToSize(__data.message, 550));
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

          if (page === 'explore') {
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
            if (page !== 'explore') {
              LinkGeneratedDialogComponent.createDialog(this.dialog, 'Report Generated Successfully', pdfLink, page !== 'hallmonitor' ? data : null);
            }
          };

          const blob = doc.output('blob', {filename: 'test'});
          // create a blob link for the PDF
          // if (isSafari) {
          //
          //   // Safari will not open URLs from createObjectURL() so this
          //   // hack with a FileReader is used instead.
          //
          //   const reader = new FileReader();
          //   reader.onloadend = () => {
          //     linkConsumer(reader.result);
          //   };
          //   reader.readAsDataURL(blob);
          //
          // } else {
          this.pdfUrl = URL.createObjectURL(blob);
          linkConsumer(this.pdfUrl);
          // }
        })
      )
  }
}
