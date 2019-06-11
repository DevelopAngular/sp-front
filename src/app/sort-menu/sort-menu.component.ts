import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {SortByItem} from '../models/SortByItem';
import {DataService} from '../services/data-service';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.scss'],
})
export class SortMenuComponent implements OnInit, OnDestroy {

  private animState: string;

  constructor(
    public dialogRef: MatDialogRef<SortMenuComponent>,
    private  dataService: DataService,
  ) {}

  sortByList: Array<SortByItem> = [
    {name: 'pass expiration time', isSelected: false, action: 'expiration_time'},
    {name: 'student name', isSelected: false, action: 'student_name'},
    {name: 'destination', isSelected: false, action: 'destination_name'},
  ];

  selectedAction: string;

  sort$ = this.dataService.sort$;


  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  selectSortOption(index): void {
    this.sortByList.forEach( (sortByItem, i) => {
        sortByItem.isSelected = i === index;
    });

    this.selectedAction = this.sortByList.find(sortByItem => {
      return sortByItem.isSelected === true;
    }).action;

    this.sort$.next(this.selectedAction);
  }
}
