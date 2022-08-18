import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { IDCardService } from '../../services/IDCardService';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-id-cards',
  templateUrl: './id-cards.component.html',
  styleUrls: ['./id-cards.component.scss']
})
export class IdCardsComponent {

  isProUser: boolean;

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private idCardService: IDCardService,
    private storage: StorageService,
    private userService: UserService
  ) {

    if (!this.userService.getFeatureFlagDigitalID()) {
      this.isProUser = true;
    }else {
      this.isProUser = false;
      this.getStarted();
      // this.idCardService.getIDCardDetailsEdit().subscribe({
      //   next: (result: any) => {
      //     if (result?.results?.digital_id_card) {
      //       const IDCARDDETAILS = result?.results?.digital_id_card;
      //       this.storage.setItem('idcard', JSON.stringify(IDCARDDETAILS));
      //       this.getStarted();
      //     }
      //   }
      // })
    }

   }

  getStarted(){
    this.router.navigate(['admin/idcards/editor'])
  }

}
