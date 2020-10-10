import { ConverterTypes } from '../../types';
import toPNG from './png';

export class Converter {
	constructor(options: ConverterTypes.Options) {
		this.name = options.name;
		this.Files = options.Files;
		this.Dimensions = options.Dimensions;
		options.Colorimetry && (this.Colorimetry = options.Colorimetry);

		if (!this.name) throw new Error('Please give your sequence a valid name.');
		if (!this.Files.destinationFolder) throw new Error('Please provide a valid destination.');
		if (!this.Files.sources) throw new Error('Please provide an array of sources (paths to the files).');
		if (!this.Dimensions.width || this.Dimensions.width <= 0)
			throw new Error('The width of the file must be greater than zero.');
		if (!this.Dimensions.height || this.Dimensions.height <= 0)
			throw new Error('The height of the file must be greater than zero.');

		return this;
	}

	Images = async (options: ConverterTypes.Parameters) => {
		return await toPNG(
			options.files || this.Files,
			options.dimensions || this.Dimensions,
			options.colorimetry || this.Colorimetry
		);
	};

	public name: string;
	public Files: ConverterTypes.Files;
	public Dimensions: ConverterTypes.Dimensions;
	public Colorimetry: ConverterTypes.Colorimetry = {
		brightness: parseInt(process.env.DEFAULT_BRIGHTNESS) || 0,
		saturation: parseInt(process.env.DEFAULT_SATURATION) || 1,
		contrast: parseInt(process.env.DEFAULT_CONTRAST) || 1,
	};
	public __results: Array<string> | string = [];
}
