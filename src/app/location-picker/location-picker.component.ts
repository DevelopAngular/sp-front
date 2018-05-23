import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Location, Paged } from '../NewModels';
import { Subject } from 'rxjs/Subject';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.css']
})
export class LocationPickerComponent implements OnInit, OnDestroy {

  @Input()
  formCtrl: FormControl;

  @Input()
  placeholder: string;

  @Input()
  category: string;

  @Input()
  required: any;

  public locationFilterCtrl: FormControl = new FormControl();
  public filteredLocations: ReplaySubject<Location[]> = new ReplaySubject<Location[]>(1);
  @ViewChild('select', {read: ElementRef}) _select: ElementRef;
  private _onDestroy = new Subject<any>();

  constructor(private http: HttpService) {
    this.filteredLocations.next([]);

    this.locationFilterCtrl.valueChanges
      .filter(query => query !== '')
      .takeUntil(this._onDestroy)
      .switchMap(query => {
        let url = 'api/methacton/v1/locations?limit=10';
        if (this.category) {
          url += '&category=' + encodeURIComponent(this.category);
        }

        if (query) {
          url += '&search=' + encodeURIComponent(query);
        }

        return this.http.get<Paged<any>>(url);
      })
      .map((json: Paged<any>) => {
        return json.results.map(raw => Location.fromJSON(raw));
      })
      .subscribe(this.filteredLocations);

  }

  ngOnInit() {
    // this code is required so that the added field exists on the available options.
    // if the option does not exist, the value won't get set.
    this.formCtrl.valueChanges.subscribe(location => {
      if (location) {
        this.filteredLocations.next([location]);
      }
    });
  }

  open() {
    this._select.nativeElement.click();
  }

  ngOnDestroy() {
    this._onDestroy.next(null);
    this._onDestroy.complete();
  }

}
