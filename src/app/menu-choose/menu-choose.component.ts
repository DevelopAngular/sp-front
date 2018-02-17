import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { DataService } from '../data-service';

@Component({
  selector: 'app-menu-choose',
  templateUrl: './menu-choose.component.html',
  styleUrls: ['./menu-choose.component.css']
})
export class MenuChooseComponent implements OnInit {
  private barer:string;
  constructor(private dataService: DataService, private router: Router) {
    
  }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    if(this.barer == "")
      this.router.navigate(['../']);
    else{
      
    }
  }

  goToList(){
    this.router.navigate(['../list']);
  }

  goToForm(){
    this.router.navigate(['../form']);
  }

}
