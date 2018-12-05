import { Component, OnInit } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { ColorProfile } from '../../models/ColorProfile';
import { HttpService } from '../../http-service';
import * as _ from 'lodash';
import {filter, finalize, map} from 'rxjs/operators';
import {PdfGeneratorService} from '../pdf-generator.service';
import {HallPass} from '../../models/HallPass';


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

  constructor(private httpService: HttpService, private pdf: PdfGeneratorService) { }

  ngOnInit() {

  }

  search() {
    if (this.selectedStudents || this.selectedDate || this.selectedRooms) {
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
               const oldDate = new Date('2013-03-10T02:00:00Z');
               const newDate = oldDate.getFullYear() + '-' + 0 + (oldDate.getMonth() + 1) + '-' + oldDate.getDate();
               return {
                   'Student Name': hallPass.student.first_name + ' ' + hallPass.student.last_name,
                   'Origin': hallPass.origin.title,
                   'Destination': hallPass.destination.title,
                   'Travel Type': travelType,
                   'Date & Time': newDate,
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
    console.log(this.tableData);

    this.tableData = this.tableData.map((row) => {
      for (const key in row) {
        row[key] = typeof row[key] !== 'string' ? row[key].toString() : row[key];
        console.log(row);
      }
      return row;
    })


    this.pdf.generate(this.tableData, null, 'l', 'search');
  }

}
