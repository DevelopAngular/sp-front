import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pinnable } from '../models/Pinnable';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root'
})
export class HallPassesService {

  constructor(private http: HttpService) { }

    getActivePasses() {
        return this.http.get('v1/hall_passes?active=true');
    }

    createPass(data) {
        return this.http.post('v1/hall_passes', data);
    }

    bulkCreatePass(data) {
        return this.http.post('v1/hall_passes/bulk_create', data);
    }

    cancelPass(id, data) {
        return this.http.post(`v1/hall_passes/${id}/cancel`, data);
    }

    endPass(id) {
        return this.http.post(`v1/hall_passes/${id}/ended`);
    }

    getPassStats() {
        return this.http.get('v1/hall_passes/stats');
    }

    getPinnables(): Observable<Pinnable[]> {
        return this.http.get('v1/pinnables/arranged');
    }

    createPinnable(data) {
        return this.http.post('v1/pinnables', data);
    }

    updatePinnable(id, data) {
        return this.http.patch(`v1/pinnables/${id}`, data);
    }

    deletePinnable(id) {
        return this.http.delete(`v1/pinnables/${id}`);
    }

    checkPinnableName(value) {
        return this.http.get(`v1/pinnables/check_fields?title=${value}`);
    }

    getArrangedPinnables() {
        return this.http.get('v1/pinnables?arranged=true');
    }

    createArrangedPinnable(body) {
        return this.http.post(`v1/pinnables/arranged`, body);
    }

    searchPasses(url) {
      return this.http.get(url);
    }
}
