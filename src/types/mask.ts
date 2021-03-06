export namespace Mask {
	export type Options = {
		map?: Array<number>;
		rpi_url?: string;
		led_count?: number;
	};

	export type Color = {
		R: number;
		G: number;
		B: number;
	};

	export namespace RpiServer {
		export type Response = {
			success: boolean;
			error?: string;
		};
	}
}
