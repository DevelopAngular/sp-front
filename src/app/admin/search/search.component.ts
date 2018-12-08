import { Component, OnInit } from '@angular/core';
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

  tableData = [];
  selectedStudents;
  selectedDate;
  selectedRooms;
  roomSearchType;
  selectedReport = [];

  spinner: boolean = false;

  hasSearched: boolean = false;
  sortParamsHeader: string;

  constructor(private httpService: HttpService, private pdf: PdfGeneratorService) { }

  ngOnInit() {

  }

  search() {
    if (this.selectedStudents || this.selectedDate || this.selectedRooms) {
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
                return {
                   'Student Name': hallPass.student.first_name + ' ' + hallPass.student.last_name,
                   'Origin': hallPass.origin.title,
                   'Destination': hallPass.destination.title,
                   'Travel Type': travelType,
                   'Date & Time': prettyReportDate,
                   'Duration': hallPass.destination.max_allowed_time
               };
            });
            this.spinner = false;
            this.hasSearched = true;
        });

    }
  }

  dateEmit(date) {
      this.selectedDate = date;
  }

  roomEmit(rooms) {
    this.selectedRooms = rooms;
  }

  studentsEmit(students) {
      this.selectedStudents = students;
  }

  previewPDF() {
      console.log(this.selectedRooms);
      if (this.selectedReport.length > 0) {
          this.selectedReport = this.selectedReport.map((row) => {
              for (const key in row) {
                  row[key] = typeof row[key] !== 'string' ? row[key] + ' min' : row[key];
                  console.log(row);
              }
              return row;
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

          this.pdf.generate(this.selectedReport, null, 'l', 'search', title);
      }
  }

}
