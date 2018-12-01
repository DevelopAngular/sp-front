import { Component, OnInit } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { ColorProfile } from '../../models/ColorProfile';
import { HttpService } from '../../http-service';
import * as _ from 'lodash';
import {filter, finalize, map} from 'rxjs/operators';
import {PdfGeneratorService} from '../pdf-generator.service';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  tableData;
  selectedStudents;
  selectedDate;
  selectedRooms;
  roomSearchType;
  selectedReport = [];

  hasSearched: boolean = false;

  constructor(private httpService: HttpService, private pdf: PdfGeneratorService) { }

  ngOnInit() {

  }

  search() {
    if (this.selectedStudents || this.selectedDate || this.selectedRooms) {
        let url = 'v1/hall_passes?';

        if(this.selectedRooms){
          console.log('Has rooms\t', this.roomSearchType)
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
        
        if(this.selectedDate){
          let start = this.selectedDate['from'].toISOString();
          let end = this.selectedDate['to'].toISOString();
          
          console.log('Start: ', start, '\nEnd: ', end);

          url += (start?('created_after=' +start +'&'):'');
          url += (end?('end_time_before=' +end):'');
        }

        this.httpService.get(url).subscribe(data =>{
          console.log(data);
        });

      //   if (this.selectedStudents) {
      //     this.passes$.pipe(filter(res => !!this.selectedStudents), map((passes: any[]) => {
      //         const studentIds = this.selectedStudents.map(student => student.id);
      //         return passes.filter(pass => {
      //             return pass.student.id === studentIds.find(id => id === pass.student.id);
      //         });
      //     }), map((passes: any[]) => {
      //         return passes.map(pass => {
      //             return {
      //                 'Student Name': pass.student.first_name + ' ' + pass.student.last_name,
      //                 'Origin': pass.origin.title,
      //                 'Destination': pass.destination.title,
      //                 'TravelType': 'type',
      //                 'Date & Time': pass.created,
      //                 'Duration': pass.destination.max_allowed_time
      //             };
      //         });
      //     }), finalize(() => this.hasSearched = true)).subscribe(res => this.tableData = res);
      // }
  
    }
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
