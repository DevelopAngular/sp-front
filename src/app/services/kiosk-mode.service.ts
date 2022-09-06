import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Location} from '../models/Location';
import {StorageService} from './storage.service';
import {LocationsService} from './locations.service';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root'
})
export class KioskModeService {

  private currentRoom$: BehaviorSubject<Location> = new BehaviorSubject(null);
  private loadingStoredKioskRoom = false;

  constructor(
    private storageService: StorageService,
    private locationsService: LocationsService,
    private http: HttpService,
  ) {
  }

  getCurrentRoom() {
    return this.currentRoom$;
  }

  setCurrentRoom(location: Location) {
    this.currentRoom$.next(location);
  }

  resetPassword(location: Location) {
    return this.http.patch(`v1//kiosk/${location.id}/password`);
  }

  getAllKioskLogin(){
    return this.http.get(`v1//kiosk/all_logins`);
  }

}
