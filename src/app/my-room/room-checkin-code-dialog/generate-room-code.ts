/* eslint-disable */
// @ts-nocheck no typescript definitions for DataView, ArrayBuffer, etc

import * as crypto from 'crypto-js';
import { sum } from 'lodash';

// generateRoomCode expects the number of seconds since epoch and the location id.
// It returns a 3 character string that is the room's code. Within a 30 second period, the room code will be identical.
// After 30 seconds, this function should be called again to get correct room code.
export function generateRoomCode(secondsSinceEpoch: number, locationId: number): string {
	// period must be an integer in order to convert to a BigInt
	const period = Math.floor(secondsSinceEpoch / 30);

	const bytes = new ArrayBuffer(16);
	new DataView(bytes).setBigUint64(0, BigInt(locationId), false);
	new DataView(bytes).setBigUint64(8, BigInt(period), false);

	const wa = crypto.lib.WordArray.create(bytes);

	const hashed = crypto.SHA1(wa);

	const sumbuffer = convertWordArrayToUint8Array(hashed);

	let num = new DataView(sumbuffer.buffer).getUint16(0, false);
	num = num % 1000;
	return String(num).padStart(3, '0');
}

/* tslint:disable */
function convertWordArrayToUint8Array(wordArray: crypto.lib.WordArray): Uint8Array {
	const len = wordArray.words.length;
	const u8_array = new Uint8Array(len << 2);
	let offset = 0;
	let word, i;

	for (i = 0; i < len; i++) {
		word = wordArray.words[i];
		u8_array[offset++] = word >> 24;
		u8_array[offset++] = (word >> 16) & 0xff;
		u8_array[offset++] = (word >> 8) & 0xff;
		u8_array[offset++] = word & 0xff;
	}
	return u8_array;
}
/* tslint:enable */
