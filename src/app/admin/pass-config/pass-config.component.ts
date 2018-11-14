import {Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit {

    settingsForm: FormGroup;
    schoolName = 'Springfield High School';

    data = [
        {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', surname: 'Petrov'},
        {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', surname: 'Petrov'},
        {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', surname: 'Petrov'},
        {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', surname: 'Petrov'},
        {position: 5, name: 'Boron', weight: 10.811, symbol: 'B', surname: 'Petrov'},
        {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', surname: 'Petrov'},
        {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', surname: 'Petrov'},
        {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', surname: 'Petrov'},
        {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', surname: 'Petrov'},
        {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', surname: 'Petrov'},
    ];

  constructor(
      private dialog: MatDialog,
  ) { }

  ngOnInit() {
      this.buildForm();
  }

  buildForm() {
      this.settingsForm = new FormGroup({
          isFuture: new FormControl(true),
          defaultTime: new FormControl('5 min'),
      });
  }

  newRoom(ev) {
      console.log(this.settingsForm.value);
    this.dialog.open(OverlayContainerComponent, {
      panelClass: 'form-dialog-container',
      width: '1000px',
      height: '700px',
      data: {object: 'START'}
    });
  }

  choiceTravel(emit) {
      console.log(emit);
  }

}
