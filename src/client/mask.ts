import { Mask, Server } from '../types';
import Logger from '../services/utils/logger';
import Axios, { AxiosResponse } from 'axios';

export class MaskClient {
	public converter_url: string = process.env.CONVERTER_URL;
	public rpi_url: string = process.env.PI_URL;
	public led_count: number = parseInt(process.env.LED_COUNT);
	private _initialized: boolean = false;

	private URLs = {
		init: '/init',
	};

	constructor(options: Mask.Options) {
		options.converter_url && (this.converter_url = options.converter_url);
		options.rpi_url && (this.rpi_url = options.rpi_url);
		options.led_count && (this.led_count = options.led_count);

		if (!this.converter_url || !this.rpi_url)
			throw new Error(
				'The Mask client must be initialized with at least the converter and Raspberry Pi URLs.'
			);

		return this;
	}

	update(options: Mask.Options) {
		options.converter_url
			? (this.converter_url = options.converter_url)
			: Logger.warn('The converter url was unchanged');
		options.rpi_url
			? (this.rpi_url = options.rpi_url)
			: Logger.warn('The Raspberry Pi url was unchanged');
		options.led_count ? (this.led_count = options.led_count) : Logger.warn('The LED count was unchanged');
	}

	handleError(error: any) {
		Logger.error(error);
		return Promise.reject('Network error');
	}

	handleResponse(response: AxiosResponse) {
		let data: Mask.RpiServer.Response = response.data;
		return data.success
			? Promise.resolve()
			: Promise.reject(data.error || 'Unknow error on the Raspberry Pi');
	}

	request(url: string, method: Server.Methods, data: any, isInit: boolean = false) {
		if (!this._initialized && !isInit)
			return Promise.reject('Please initialize the client first with the init() method.');
		return Axios({ url, method, data }).then(this.handleResponse).catch(this.handleError);
	}

	init(maxBrightness: number = 10) {
		return this.request(`${this.rpi_url}${this.URLs.init}`, 'POST', { maxBrightness }, true).then(
			(_: any) => (this._initialized = true)
		);
	}

	Sequences = {
		play: (name: string) => {},
		get: () => {},
		upload: () => {},
		Lists: {
			get: () => {},
			play: (name: string) => {},
			save: () => {},
		},
	};

	Pixels = {
		fill: (color: Mask.Color) => {},
	};

	/* Boot up the Mask with a default sequence */
	async on() {
		await this.init();
		process.env.BOOTUP_SEQUENCE
			? this.Sequences.play(process.env.BOOTUP_SEQUENCE)
			: Logger.warn(
					'The Mask was initialized but no bootup sequence was played. Please define the BOOTUP_SEQUENCE environement variable'
			  );
	}

	/* Shuts the mask down */
	off() {}
}
