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

  addStudent(body){
    return this.http.get('v1/parent/add_student', body);
  }
}
