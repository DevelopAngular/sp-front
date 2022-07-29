import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { IDCardService } from '../../services/IDCardService';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-id-cards',
  templateUrl: './id-cards.component.html',
  styleUrls: ['./id-cards.component.scss']
})
export class IdCardsComponent {

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private idCardService: IDCardService,
    private storage: StorageService,
  ) {

    this.idCardService.getIDCardDetailsEdit().subscribe({
      next: (result: any) => {
        if (result?.results?.digital_id_card) {
          const IDCARDDETAILS = result?.results?.digital_id_card;
          this.storage.setItem('idcard', JSON.stringify(IDCARDDETAILS));
          this.getStarted();
        }
      }
    })
   }

  getStarted(){
    this.router.navigate(['admin/idcards/editor'])
  }

}
