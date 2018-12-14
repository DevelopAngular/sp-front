import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { ColorProfile } from '../../models/ColorProfile';
import { HttpService } from '../../http-service';
import * as _ from 'lodash';
import {filter, finalize, map} from 'rxjs/operators';
import {PdfGeneratorService} from '../pdf-generator.service';
import {HallPass} from '../../models/HallPass';
import {DatePrettyHelper} from '../date-pretty.helper';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild('printPdf') printPdf: ElementRef;

  tableData = [];
  selectedStudents = [];
  selectedDate;
  selectedRooms = [];
  roomSearchType;
  selectedReport = [];

  spinner: boolean = false;

  hasSearched: boolean = false;
  sortParamsHeader: string;

  constructor(private httpService: HttpService, private pdf: PdfGeneratorService) { }

  ngOnInit() {

  }

  search() {
    if (this.selectedStudents.length || this.selectedDate || this.selectedRooms.length) {
      this.sortParamsHeader = `All Passes, Searching by ${(this.selectedStudents && this.selectedStudents.length > 0 ? 'Student Name' : '') + (this.selectedDate && this.selectedDate !== '' ? ', Date & Time' : '') + (this.selectedRooms && this.selectedRooms.length > 0 ? ', Room Name' : '')}`;
        this.spinner = true;
        this.selectedReport = [];
        let url = 'v1/hall_passes?';
        if(this.selectedRooms){
          console.log('Has rooms\t', this.roomSearchType);
          if(this.roomSearchType=='Origin'){
            let origins: any[] = this.selectedRooms.map(r => r['id']);

            Array.from(Array(origins.length).keys()).map(i => {url += 'origin=' +origins[i] +'&'});
          }

          if(this.roomSearchType=='Destination'){
            let destinations: any[] = this.selectedRooms.map(r => r['id']);

            Array.from(Array(destinations.length).keys()).map(i => {url += 'destination=' +destinations[i] +'&'});
          }

          if(this.roomSearchType=='Either'){
            let locations: any[] = this.selectedRooms.map(r => r['id']);

            Array.from(Array(locations.length).keys()).map(i => {url += 'location=' +locations[i] +'&'});
          }
        }

        if(this.selectedStudents){
          let students: any[] = this.selectedStudents.map(s => s['id']);

          Array.from(Array(students.length).keys()).map(i => {url += 'student=' +students[i] +'&'});
        }

        if (this.selectedDate) {
          let start = this.selectedDate['from'].toISOString();
          let end = this.selectedDate['to'].toISOString();

          console.log('Start: ', start, '\nEnd: ', end);

          url += (start?('created_after=' +start +'&'):'');
          url += (end?('end_time_before=' +end):'');
        }

        this.httpService.get(url).pipe(filter(res => !!res))
            .subscribe((data: HallPass[]) => {
                console.log('DATA', data);
            this.tableData = data.map(hallPass => {
                let travelType;
                if (hallPass.travel_type === 'one_way') { travelType = 'One Way'; }
                if (hallPass.travel_type === 'round_trip') { travelType = 'Round Trip'; }
                if (hallPass.travel_type === 'both') { travelType = 'Both'; }
                const reportDate = new Date(hallPass.created);
                const time = reportDate.getHours() < 12
                    ?
                    `${reportDate.getHours()}:${reportDate.getMinutes() < 10 ? '0' : ''}${reportDate.getMinutes()} AM`
                    :
                    `${reportDate.getHours() - 12}:${reportDate.getMinutes() < 10 ? '0' : ''}${reportDate.getMinutes()} PM`;
                const prettyReportDate = `${reportDate.getMonth() + 1}/${reportDate.getDate()}  ${time}`;
                const diff: number = (new Date(hallPass.end_time).getTime() - new Date(hallPass.start_time).getTime()) / 1000;
                const mins: number = Math.floor(Math.floor(diff) / 60);
                const secs: number = Math.abs(Math.floor(diff) % 60);
                const duration = mins + (secs === 0 ? '' : ':') + (secs === 0 ? '' : secs < 10 ? '0' + secs : secs) + ' min';
                return {
                   'Student Name': hallPass.student.first_name + ' ' + hallPass.student.last_name,
                   'Origin': hallPass.origin.title,
                   'Destination': hallPass.destination.title,
                   'Travel Type': travelType,
                   'Date & Time': prettyReportDate,
                   'Duration': duration
               };
            });
            this.spinner = false;
            this.hasSearched = true;
        });

    }
  }

  dateEmit(date) {
    console.log(date);
    this.selectedDate = date;
  }

  roomEmit(rooms) {
    console.log(rooms);
    this.selectedRooms = rooms;
  }

  studentsEmit(students) {
    console.log(students);
    this.selectedStudents = students;
  }
  resetSearchState() {
    this.tableData = [];
    this.selectedStudents = [];
    this.selectedReport = [];
    this.hasSearched = false;
  }
  previewPDF() {
      console.log(this.selectedRooms);
      if (this.selectedReport.length > 0) {
           const _selectedReport = this.selectedReport.map((row) => {
              const _copy = {};
              for (const key in row) {
                  _copy[key] = typeof row[key] !== 'string' ? row[key] + ' min' : row[key];
              }
              return _copy;
          });

          let prettyFrom = '';
          let prettyTo = '';
          if ( this.selectedDate ) {
            prettyFrom = DatePrettyHelper.transform(this.selectedDate.from);
            prettyTo = DatePrettyHelper.transform(this.selectedDate.to);
          }
          let rooms = '';
          if (this.selectedRooms) {
            rooms = this.selectedRooms.map((room) => {
              return room.title;
            }).join(', ');
          }

          const title = `${this.sortParamsHeader}: ${this.selectedDate ? `from ${prettyFrom} to ${prettyTo};` : ''} ${this.selectedRooms ? rooms : ''}`;

          this.pdf.generate(_selectedReport,  this.printPdf.nativeElement, 'l', 'search', title);;

          // setTimeout(() => {
          //   this.printPdf.nativeElement.click();
          // }, 3000);
      }
  }

}
