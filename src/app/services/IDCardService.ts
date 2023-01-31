import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

export interface IDCard {
	userName?: string;
	schoolName?: string;
	userRole?: string;
	profilePicture?: string;
	idNumberData?: { idNumber: string; barcodeURL: any };
	greadLevel?: string;
	backgroundColor?: string;
	logoURL?: string;
	backsideText?: string;
	showCustomID?: boolean;
	barcodeType?: string;
}

export interface BarcodeTypes {
	label: string;
	action: string;
	icon: string;
	textColor: string;
	backgroundColor: string;
}

interface IDCardResponse {
	results: {
		digital_id_card: {
			backside_text: string;
			barcode_type: 'qr-code' | 'code39';
			color: string; // hex color
			datetime_created: string; // ISO Date String with Timezone "2022-07-26T06:23:52.35771Z"
			enabled: boolean;
			id: number;
			logo_bucket: string;
			logo_file_name: string;
			logo_object_name: string;
			school_id: number;
			show_custom_ids: boolean;
			show_grade_levels: boolean;
			signed_url: string;
			visible_to_who: string;
		};
	};
}

export const BARCODE_TYPES: BarcodeTypes[] = [
	{
		label: 'Traditional',
		icon: './assets/Barcode (Black).svg',
		textColor: '#7f879d',
		backgroundColor: '#F4F4F4',
		action: 'code39',
	},
	{
		label: 'QR Code',
		icon: './assets/QR Code (Black).svg',
		textColor: '#7f879d',
		backgroundColor: '#F4F4F4',
		action: 'qr-code',
	},
];

@Injectable({
	providedIn: 'root',
})
export class IDCardService {
	constructor(private http: HttpService) {}

	addIDCard(body) {
		return this.http.post('v1/id_card', body);
	}

	enableIDCard() {
		return this.http.patch('v1/id_card/enable');
	}

	disableIDCard() {
		return this.http.patch('v1/id_card/disable');
	}

	getIDCardDetails() {
		return this.http.get('v1/id_card');
	}

	getIDCardDetailsEdit() {
		return this.http.get<IDCardResponse>('v1/id_card/edit');
	}

	updateIDCardField(body) {
		return this.http.patch('v1/id_card', body);
	}
}
