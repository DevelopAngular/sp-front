import {Component, Input, OnInit, ViewChildren, QueryList, NgZone} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {MapsAPILoader} from '@agm/core';

@Component({
  selector: 'app-list-schools',
  templateUrl: './list-schools.component.html',
  styleUrls: ['./list-schools.component.scss']
})
export class ListSchoolsComponent implements OnInit {

  @Input() form: FormGroup;
  @ViewChildren('locationInput') locationInputs: QueryList<any>;

  inputCount: number = 1;

  constructor(private fb: FormBuilder,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.addSchool();
  }

  ngAfterViewInit() {
    this.mapsAPILoader.load().then(() => {
      this.locationInputs.forEach((element, index) => {
        this.addAutoComplete(element.nativeElement, index);
      });
      this.locationInputs.changes.subscribe((list) => {
        if (this.inputCount < list.length) {
          this.addAutoComplete(list.last.nativeElement, list.length - 1);
        }
        this.inputCount = list.length;
      });
    });
  }

  get schools(): FormArray {
    return this.form.controls.schools as FormArray;
  }

  addSchool(): void {
    this.schools.push(
      this.fb.group({
        name: '',
        population: '',
      })
    );
  }

  showRemove(): boolean {
    if (this.schools.length == 1) {
      return false;
    }
    return true;
  }

  removeSchool(index): void {
    let data = this.schools.removeAt(index);
  }

  addAutoComplete(element, index){
    const autocomplete = new google.maps.places.Autocomplete(element);
    autocomplete.setFields(['address_component', 'name']);
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = autocomplete.getPlace();
        let address = place.name;
        let addressParts = ['administrative_area_level_1', 'country'];
        addressParts.forEach((element, index) => {
          let name = this.getAddressPart(place, element);
          if(name)
            address += ', ' + name;
        });
        this.schools.at(index).get('name').setValue(address);

      });
    });
  }

  getAddressPart(place, part): string {
    for(let i = 0; i < place.address_components.length; i++) {
      if (place.address_components[i].types.includes(part))
        return place.address_components[i].long_name;
    }
    return null;
  }

}
