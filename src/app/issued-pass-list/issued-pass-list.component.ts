import { Component, OnInit } from '@angular/core';
import {PendingPass, User, Location} from '../models';
import { HttpService } from '../http-service';
import { DataService } from '../data-service';
import {JSONSerializer} from '../models';

export interface SelectItem{
    label;
    value;
}

@Component({
    selector: 'app-issued-pass-list',
    templateUrl: './issued-pass-list.component.html',
    styleUrls: ['./issued-pass-list.component.css']
})

export class IssuedPassListComponent implements OnInit {

    pendingPasses:Promise<PendingPass[]>;

    selectedPendingPass: PendingPass;

    displayDialog: boolean;

    sortOptions: SelectItem[];

    sortKey: string;

    sortField: string;

    sortOrder: number;

    passType: string = "pending_passes";

    title: string = "Pending Pass";

    isPending: boolean = true;

    barer;
    user: User;

    constructor(private http: HttpService, private dataService: DataService, private serializer: JSONSerializer) { }

    ngOnInit() {
        this.dataService.currentBarer.subscribe(barer => this.barer = barer);
        this.dataService.currentUser.subscribe(user => this.user = user);
        this.getPendingPasses();

        this.sortOptions = [
            {label: 'Pending Passes', value: 'pending_passes'},
            {label: 'Hall Passes', value: 'hall_passes'},
            ];
    }

    onSortChange(event) {
        const value = event.value;
        //console.log("[Pass Type]", value);
        this.passType = value;
        if(value == "pending_passes"){
            this.title = "Pending Pass";
            this.isPending = true;
        } else{
            this.title = "Hall Pass";
            this.isPending = false;
        }
        this.updatePasses();
    }

    onDialogHide() {
        this.selectedPendingPass = null;
    }

    getPendingPasses(){
        const config = {headers: {'Authorization': 'Bearer ' + this.barer}};
        this.pendingPasses = this.http.get<PendingPass[]>('api/methacton/v1/' +this.passType +'?revoked=false&issuer=' +this.user.id, config).toPromise();
    }

    updatePasses(){
        console.log("Updating Passes");
        this.getPendingPasses();
    }

}
