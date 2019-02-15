import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(private http: HttpService) { }

    //// Invitations
    createInvitation(data) {
        return this.http.post('v1/invitations/bulk_create', data);
    }

    acceptInvitation(id, data) {
        return this.http.post(`v1/invitations/${id}/accept`, data);
    }

    denyInvitation(id, data) {
        return this.http.post(`v1/invitations/${id}/deny`, data);
    }

    cancelInvitation(id, data) {
        return this.http.post(`v1/invitations/${id}/cancel`, data);
    }

    /// Requests
    createRequest(data) {
        return this.http.post('v1/pass_requests', data);
    }

    acceptRequest(id, data) {
        return this.http.post(`v1/pass_requests/${id}/accept`, data);
    }

    denyRequest(id, data) {
        return this.http.post(`v1/pass_requests/${id}/deny`, data);
    }

    cancelRequest(id) {
        return this.http.post(`v1/pass_requests/${id}/cancel`);
    }
}
