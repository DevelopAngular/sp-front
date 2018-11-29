import {Inject, Injectable} from '@angular/core';
import {AdminModule} from './admin.module';

declare const jsPDF;
declare const window;

@Injectable()
export class PdfGeneratorService {

  constructor(
  ) { }

  generate(data: any[], headers?: string[]): void {

    const _headers: string[] = headers ||  Object.keys(data[0]);
    const _data: any[] = data;
      // .concat(data, data, data, data, data);

    const doc = new jsPDF('p', 'pt');
    let page: number = 1;

    const A4 = {
      height: 842,
      width: 595,
    }

    const table = {
      top: 153,
      left: 29,
      right: 29,
      lh: 30,
      sp: 133,
      col: 11,
      drawHeaders: (__headers: string[]) => {

        doc.setFontSize(12);
        doc.setTextColor('#3D396B');
        doc.setFontStyle('bold');

        __headers.forEach((header, n) => {
          doc.text(table.left + ( table.sp * n), table.top - 6, header );
        });
        // doc.text(table.left + ( table.sp * 0), table.top - 6, "Student Name" );
        // doc.text(table.left + ( table.sp * 1), table.top - 6, "Origin" );
        // doc.text(table.left + ( table.sp * 2), table.top - 6, "Dastination" );
        // doc.text(table.left + ( table.sp * 3), table.top - 6, "Travel Type" );

        doc.setLineWidth(1.5);
        doc.line(table.left, table.top + 6, A4.width - table.right, table.top + 6);
        // doc.line(table.left, 87, A4.width - table.right, 87);
      },
      drawRows: (__data) => {
        // 'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'
        doc.setLineWidth(0.5);
        doc.setFontSize(12);
        doc.setTextColor('#555555');
        doc.setFontStyle('normal');

        // console.log(__data);

        // else {
        //   console.log("currentData grater that page size", __data);
        //   doc.addPage();
        //   table.top = 29;
        //   doc.setPage(++page);
        // }
        function __internalIteration(d) {
          let breakLoop: boolean = false;
          let cell, n;
          if (d && d.length) {

            for (let j = 0; j < d.length; j++) {
              console.log("VALUE", table.top + table.lh * (n ))
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

          // d.forEach((cell, n) => {
          //
          //   console.log("VALUE", table.top + table.lh * (n ))
          //
          //
          //
          //   if (( table.top + table.lh * (n + 1)) > (A4.height - 50) ) {
          //     doc.addPage();
          //     table.top = 29;
          //     doc.setPage(++page);
          //   }
          //   _headers.forEach((header, i) => {
          //
          //     doc.text(table.left + ( table.sp * i), table.top + table.lh * (n + 1), cell[_headers[i]]);
          //
          //   });
          //   doc.line(table.left,  table.top + table.lh * (n + 1) + 8, A4.width - table.right, table.top + table.lh * (n + 1) + 8);
          //
          // });
        }
        __internalIteration(__data);





        // doc.text(table.left + ( table.sp * 0), table.top + table.lh * n, "Hellen Keller" );
        // doc.text(table.left + ( table.sp * 1), table.top + table.lh * n, "Washington" );
        // doc.text(table.left + ( table.sp * 2), table.top + table.lh * n, "Nurse" );
        // doc.text(table.left + ( table.sp * 3), table.top + table.lh * n, "OW" );

        // doc.setLineWidth(0.5);
        // doc.line(table.left,  table.top + table.lh * n + 8, A4.width - table.right, table.top + table.lh * n + 8);
      },
    };


    // doc.setPage(page);
    doc.setFontSize(24);
    doc.text(170, 57, 'Active Hall Pass Report');

    doc.line(table.left, 72, A4.width - table.right, 72);

    doc.setFontSize(14);
    doc.text(table.left, 110, 'All Active Hall Passes on mm:dd:yy at hh:mm (AM/PM)');
    table.drawHeaders(_headers);
    table.drawRows(_data);




    // const columns = [
    //   {title: 'Student Name', dataKey: 'student name'},
    //   {title: 'Origin', dataKey: 'origin'},
    //   {title: 'Destination', dataKey: 'destination'},
    //   {title: 'Travel Type', dataKey: 'travel type'},
    // ];
    //
    // const rows = [
    //   {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
    //   {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
    //   {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
    //   {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
    //   {'student name': 'Hellen Keller', 'origin': 'Washington', 'destination': 'Nurse', 'travel type' : 'OW'},
    // ];

    const currentHost = `${window.location.protocol}//${window.location.host}`;

    window.open(`${currentHost}/pdf/${encodeURIComponent(doc.output('datauristring'))}`);
  }
}
