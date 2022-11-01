import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

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

  getStudentInviteCode(){
    return this.http.get(`v1/schools/${this.http.getSchool().id}/student_invite_codes`, {responseType: 'blob' as 'json'}).subscribe(
      (response: any) =>{
          let dataType = response.type;
          let binaryData = [];
          binaryData.push(response);
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
          downloadLink.setAttribute('download', 'Student invite codes');
          document.body.appendChild(downloadLink);
          downloadLink.click();
      }
  )
  }

  getParentsMetrics() {
    return this.http.get('v1/parent/metrics');
  }

  getUnconnectedStudents() {
    return this.http.get('v1/parent/unconnected_students', {responseType: 'blob' as 'json'}).subscribe(
      (response: any) =>{
          let dataType = response.type;
          let binaryData = [];
          binaryData.push(response);
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
          downloadLink.setAttribute('download', 'Unconnected Students');
          document.body.appendChild(downloadLink);
          downloadLink.click();
      }
  )
  }

}
