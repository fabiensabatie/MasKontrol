import { SequenceOptions } from '../../types';
import Conversions from '../utils/conversions';

export class Sequence {
	private __buffer_index: number = 0;
	private __buffer: Int8Array;
	private __name: string;
	private __images: Array<string> = [];
	private __width: number;
	private __height: number;
	private __brightness: number = process.env.DEFAULT_BRIGHTNESS
		? parseInt(process.env.DEFAULT_BRIGHTNESS)
		: 10;
	private __speed: number = process.env.DEFAULT_SPEED ? parseInt(process.env.DEFAULT_SPEED) : 10;
	private __ext: string = '.seq';
	private __map: Array<number> = [];

	constructor(options: SequenceOptions) {
		this.__name = options.name;
		this.__images = options.images;
		this.__width = options.width;
		this.__height = options.height;
		this.__map = options.map;

		if (!this.__name) throw new Error('Please give your sequence a valid name.');
		if (!this.__images)
			throw new Error('The sequence must be initialized with an array of valid paths to images.');
		if (!this.__width || this.__width <= 0)
			throw new Error('The width of the sequence must be greater than zero.');
		if (!this.__height || this.__height <= 0)
			throw new Error('The height of the sequence must be greater than zero.');

		return this;
	}

	/* WE DON'T NEED THE MAP IN THE FILE, IT MUST BE SENT THROUGH THE CLIENT AND STORED ON THE PI */
	writeHeader() {
		let amountOfFrames: number[] = Conversions.int64.to['8Bytes'](this.__images.length);
	}
}
