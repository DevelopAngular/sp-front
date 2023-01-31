type IntroDeviceTypes = 'universal' | 'ios' | 'android' | 'web';
export type SingleIntro = Record<IntroDeviceTypes, { seen_version: string }>;

export interface IntroData {
	[key: string]: SingleIntro;
}

export interface IIntrosState {
	data: IntroData;
	loading: boolean;
	loaded: boolean;
}
