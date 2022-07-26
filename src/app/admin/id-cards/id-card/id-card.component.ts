import { Component, Input, OnInit } from "@angular/core";
import { DarkThemeSwitch } from "../../../dark-theme-switch";
import { User } from "../../../models/User";
import { UserService } from "../../../services/user.service";

@Component({
  selector: "app-id-card",
  templateUrl: "./id-card.component.html",
  styleUrls: ["./id-card.component.scss"],
})
export class IdCardComponent implements OnInit {

  @Input() userName: string = 'Dan San Buenaventura';
  @Input() schoolName: string = 'Walt Whitman High School';
  @Input() userRole: string = 'Staff';
  @Input() backgroundColor: string = "#00B476";
  @Input() profile_picture: string;
  @Input() backsideText: string;
  @Input() logoURL: string;
  @Input() IDNumberData: any = {};
  @Input() greadLevel: number;
  @Input() buttonBackColor: string = '#FFFFFF';
  @Input() isDummyCard: boolean = false;
  @Input() isLoggedIn: boolean = true;

  userDetails: any;

  constructor(
    public darkTheme: DarkThemeSwitch,
    private userService: UserService,
    ) {
  }

  ngOnInit(): void {
    console.log("isLoggedIn : ", this.isLoggedIn)
    if (this.isLoggedIn) {
      this.userService.user$.subscribe({
        next: user => {
          this.userDetails = User.fromJSON(user);
          this.userName = this.userDetails.display_name;
           this.userRole = this.userDetails.isStudent() ? 'Student' : 'Staff'
           this.profile_picture = this.userDetails?.profile_picture;
          console.log("User : ",this.userDetails, this.userDetails.isStudent(), this.userDetails.isAdmin(), this.userDetails.isAssistant())
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
