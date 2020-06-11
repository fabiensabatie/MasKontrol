import { Converter } from './converter';
import { ConverterTypes } from '../../types';
import Conversions from '../utils/conversions';
import Fs from 'fs';
import { PNG } from 'pngjs';
import { Folders } from '../utils/files';
import Logger from '../utils/logger';
import Ora from 'ora';

export class Sequence extends Converter {
	private __buffer_index: number = 0;
	private __buffer: Int8Array;

	constructor(options: ConverterTypes.Options) {
		super(options);
	}

	writeHeader() {
		/*
			Buffer contains 8 bytes for the number of frames,
			2 bytes for the width and the height (<255 each),
			and RGG colors for each pixel
		*/
		this.__buffer = new Int8Array(
			10 + this.Files.sources.length * this.Dimensions.width * this.Dimensions.height * 3
		);
		const amountOfFrames: number[] = Conversions.int64.to['8Bytes'](this.Files.sources.length);
		amountOfFrames.map((byte: number) => (this.__buffer[this.__buffer_index++] = byte));
		this.__buffer[this.__buffer_index++] = this.Dimensions.width;
		this.__buffer[this.__buffer_index++] = this.Dimensions.height;
	}

	async writeFrame(path: string) {
		const _sequence = this;
		if (path.indexOf('.png') < 0)
			throw new Error(
				`Sequences frames can only be created from PNG images : ${path} is not a valid PNG image.`
			);
		return new Promise((resolve, reject) => {
			try {
				Fs.createReadStream(path)
					.pipe(new PNG({ filterType: 4 }))
					.on('parsed', function () {
						for (var y = 0; y < _sequence.Dimensions.height; y++) {
							for (var x = 0; x < _sequence.Dimensions.width; x++) {
								const binaryIndex = (_sequence.Dimensions.width * y + x) << 2;
								_sequence.__buffer[_sequence.__buffer_index++] = this.data[binaryIndex];
								_sequence.__buffer[_sequence.__buffer_index++] = this.data[binaryIndex + 1];
								_sequence.__buffer[_sequence.__buffer_index++] = this.data[binaryIndex + 2];
							}
						}
					});
				return resolve();
			} catch (err) {
				return reject(err);
			}
		});
	}

	async writeBody(Files?: ConverterTypes.Files) {
		Files = Files ? Files : this.Files;
		if (!Array.isArray(this.Files.sources)) throw new Error('The sources must an array');
		this.Files.sources.map(async (path: string) => await this.writeFrame(path));
		Logger.success('Successfully wrote the sequence body.');
		await this.writeToFile(Files);
	}

	async writeToFile(Files?: ConverterTypes.Files) {
		Files = Files ? Files : this.Files;
		await Folders.getOrCreate(Files.destinationFolder);
		const destinationPath = `${Files.destinationFolder}/${this.name}.${Files.destinationFormat}`;
		Fs.writeFileSync(destinationPath, this.__buffer);
		Logger.success('Successfully wrote the buffer into a file : ' + destinationPath);
		this.__results = destinationPath;
	}

	async convert() {
		await this.Images({
			files: {
				destinationFolder: process.cwd() + '/' + (process.env.TMP_FOLDER || 'tmp'),
				destinationFormat: 'png',
				sources: this.Files.sources,
			},
		});
		this.Files.sources = this.__results;
		this.writeHeader();
		this.writeBody({
			destinationFolder: process.cwd() + '/' + (process.env.SEQUENCES_FOLDER || 'sequences'),
			destinationFormat: this.Files.destinationFormat,
			sources: this.Files.sources,
		});
		return this.__results;
	}
}

(async () => {
	const Options = {
		name: 'Bunny Rabbit',
		Files: {
			sources: '/Users/fabiensabatie/Movies/big_buck_bunny.mp4',
			destinationFormat: 'seq',
			destinationFolder: '/Users/fabiensabatie/Movies',
		},
		Dimensions: {
			width: 43,
			height: 26,
		},
	};
	const sequence = new Sequence(Options).convert();
})().catch(console.log);
