export namespace Converter {
	export type Parameters = {
		files?: Files;
		dimensions?: Dimensions;
		colorimetry?: Colorimetry;
	};

	export type Colorimetry = {
		brightness: number;
		saturation: number;
		contrast: number;
	};

	export type Files = {
		sources: Array<string> | string;
		destinationFolder: string;
		destinationFormat: string;
	};

	export type Dimensions = {
		width: number;
		height: number;
	};

	export type Options = {
		name: string;
		Dimensions: Dimensions;
		Files: Files;
		Colorimetry?: Colorimetry;
	};
}
