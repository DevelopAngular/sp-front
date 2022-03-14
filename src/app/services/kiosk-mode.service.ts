import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Location} from '../models/Location';
import {StorageService} from './storage.service';
import {LocationsService} from './locations.service';

@Injectable({
  providedIn: 'root'
})
export class KioskModeService {

  private currentRoom$: BehaviorSubject<Location> = new BehaviorSubject(null);
  private loadingStoredKioskRoom = false;

  constructor(
    private storageService: StorageService,
    private locationsService: LocationsService,
  ) {
  }

  getCurrentRoom() {
    return this.currentRoom$;
  }

  setCurrentRoom(location: Location) {
    this.currentRoom$.next(location);
  }

}
