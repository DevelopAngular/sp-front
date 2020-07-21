import { Injectable } from '@angular/core';
import {HttpService} from '../../services/http-service';

export type SPPlatform = 'ios' | 'android' | 'web';

@Injectable({
  providedIn: 'root'
})
export class NextReleaseService {

  constructor(
    private http: HttpService
  ) { }

  getLastReleasedUpdates(platform: SPPlatform) {
    return this.http.get(`v1/airtable_updates?platform=${platform}`);
  }

  dismissUpdate(id: number, platform: SPPlatform) {
    return this.http.post('v1/airtable_updates/dismiss', {id, platform});
  }

}
