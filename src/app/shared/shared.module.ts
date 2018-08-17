import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { GradientButtonComponent } from '../gradient-button/gradient-button.component';
import { PassCellComponent } from '../pass-cell/pass-cell.component';
import { PassCollectionComponent } from '../pass-collection/pass-collection.component';
import { PassTileComponent } from '../pass-tile/pass-tile.component';
import { ResolveAssetPipe } from '../resolve-asset.pipe';
import { SmartpassLogoComponent } from '../smartpass-logo/smartpass-logo.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
  ],
  exports: [
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
  ],
})
export class SharedModule { }
