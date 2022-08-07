import { Component, Input, OnInit } from "@angular/core";
import { DarkThemeSwitch } from "../../../dark-theme-switch";
import { User } from "../../../models/User";
import { QRBarcodeGeneratorService } from "../../../services/qrbarcode-generator.service";
import { UserService } from "../../../services/user.service";

@Component({
  selector: "app-id-card",
  templateUrl: "./id-card.component.html",
  styleUrls: ["./id-card.component.scss"],
})
export class IdCardComponent implements OnInit {

  @Input() userName: string = 'Nicholas Demarco';
  @Input() schoolName: string = 'Walt Whitman High School';
  @Input() userRole: string = 'Staff';
  @Input() backgroundColor: string = "#00B476";
  @Input() barcodeType: string = "qr-code";
  @Input() profile_picture: string;
  @Input() backsideText: string;
  @Input() logoURL: string;
  @Input() IDNumberData: any = {};
  @Input() greadLevel: number;
  @Input() buttonBackColor: string = '#FFFFFF';
  @Input() isDummyCard: boolean = false;
  @Input() isLoggedIn: boolean = true;
  @Input() showCustomID: boolean = false;

  userDetails: any;

  constructor(
    public darkTheme: DarkThemeSwitch,
    private userService: UserService,
    private qrBarcodeGenerator: QRBarcodeGeneratorService
    ) {
  }

  ngOnInit(): void {
    this.schoolName = this.userService.getUserSchool().name;
    if (this.isLoggedIn) {
      this.userService.user$.subscribe({
        next: async user => {
          this.userDetails = User.fromJSON(user);
          this.userName = this.userDetails.display_name;
           this.userRole = this.userDetails.isStudent() ? 'Student' : 'Staff'
           this.profile_picture = this.userDetails?.profile_picture;
           this.greadLevel = this.userDetails?.grade_level;
          if (this.showCustomID && this.userDetails?.custom_id && this.userDetails?.custom_id != undefined) {
            this.IDNumberData.idNumber = this.userDetails?.custom_id
            this.IDNumberData.barcodeURL =  await this.qrBarcodeGenerator.selectBarcodeType(
              this.barcodeType,
              this.IDNumberData.idNumber
            )
          }else {
            this.showCustomID = false;
          }
        }
      })
    }
  }

  get getButtonText(): string {
    return document.getElementById("flip-box-inner").style.transform ==
      "rotateY(180deg)"
      ? "Flip to front"
      : "Flip to back";
  }

  get selectedBarcodeType(): string {
    return this.IDNumberData?.type;
  }

  toggleFlip() {
    if (
      document.getElementById("flip-box-inner").style.transform ==
      "rotateY(180deg)"
    ) {
      document.getElementById("flip-box-inner").style.transform =
        "rotateY(0deg)";
    } else {
      document.getElementById("flip-box-inner").style.transform =
        "rotateY(180deg)";
    }
  }

  urlify(text) {
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    //var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url, b, c) {
      var url2 = c == "www." ? "http://" + url : url;
      return '<a href="' + url2 + '" target="_blank">' + url + "</a>";
    });
  }
}
