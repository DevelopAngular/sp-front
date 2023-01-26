import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

export interface StudentResponse {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  created: string; // return as timestamp Date string
  first_login: string; // return as timestamp Date string
  last_login: string; // return as timestamp Date string
  last_updated: string; // return as timestamp Date string
  last_active: string;
  active: boolean;
  badge: string;
  custom_id: string;
  demo_account: boolean;
  extras: Record<string, any>;
  passes_restricted: string;
  primary_email: string;
  profile_picture: string;
  roles: string[];
  school_id: number;
  school_name: string;
  show_expired_passes: boolean;
  show_profile_pictures: string;
  specific_approvers: any[];
  status: string;
  sync_types: any[];
  username: string;
}

export interface ParentResponse {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  created: string; // return as timestamp Date string
  first_login: string; // return as timestamp Date string
  last_login: string; // return as timestamp Date string
  last_updated: string; // return as timestamp Date string
  last_active: string;
  active: boolean;
  badge: string;
  custom_id: string;
  demo_account: boolean;
  extras: Record<string, any>;
  passes_restricted: string;
  primary_email: string;
  profile_picture: string;
  roles: string[];
  show_expired_passes: boolean;
  show_profile_pictures: string;
  specific_approvers: any[];
  status: string;
  sync_types: any[];
  username: string;
  students: StudentResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class ParentAccountService {

  constructor(
    private http: HttpService,
  ) { }

  parentSignup(body) {
    return this.http.post('v1/parent/sign_up', body);
  }

  parentLogin(body) {
    return this.http.post('v1/parent/login', body);
  }

  parentUpdate(body) {
    return this.http.patch('v1/parent/@me', body);
  }

  getStudents() {
    return this.http.get('v1/parent/get_students');
  }

  getParentInfo() {
    return this.http.get('v1/parent/@me');
  }

  addStudent(body) {
    return this.http.post('v1/parent/add_student', body);
  }

  removeStudent(id) {
    return this.http.delete(`v1/parent/remove_student/${id}`);
  }

  getStudentInviteCode() {
    return this.http.get(`v1/schools/${this.http.getSchool().id}/student_invite_codes`).subscribe(
      (response: any) => {
          const downloadLink = document.createElement('a');
          downloadLink.href = response.download_url;
          document.body.appendChild(downloadLink);
          downloadLink.click();
      }
    );
  }

  getParentsMetrics() {
    return this.http.get('v1/parent/metrics');
  }

  getConnectedParents() {
    return this.http.get<{results}>('v1/parent/all');
  }

  getUnconnectedStudents() {
    return this.http.get('v1/parent/unconnected_students', {responseType: 'blob' as 'json'}).subscribe(
      (response: any) =>{
          let dataType = response.type;
          let binaryData = [];
          binaryData.push(response);
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
          downloadLink.setAttribute('download', `${this.http.getSchool().name} - Parent Invite Codes (Unconnected)`);
          document.body.appendChild(downloadLink);
          downloadLink.click();
      }
  )
  }

}
