import { ConverterTypes } from '../../types';
import ffmpeg from 'fluent-ffmpeg';
import Fs from 'fs';
import Ora from 'ora';
import Logger from '../utils/logger';
import { Folders } from '../utils/files';

export default async function toImage(
	file: ConverterTypes.Files,
	dimensions: ConverterTypes.Dimensions,
	colorimetry: ConverterTypes.Colorimetry
): Promise<any> {
	return new Promise(async (resolve, reject) => {
		if (file.sources[0] !== '/') reject('Please provide an absolute path to the file');

		Logger.info('Get or creating the folder : ' + file.destinationFolder);
		await Folders.getOrCreate(file.destinationFolder);
		Logger.info('Found the folder : ' + file.destinationFolder);

		const outputOtions =
			`-vf scale=${dimensions.width}:${dimensions.height}` +
			`,eq=contrast=${colorimetry.contrast}:brightness=${colorimetry.brightness}:saturation=${colorimetry.saturation}`;

		const spinner = Ora({
			color: 'green',
			text: `Converting a file to ${file.destinationFormat.toUpperCase()} images.`,
			spinner: 'bouncingBall',
		});

		ffmpeg(file.sources)
			.outputOption(outputOtions)
			.output(`${file.destinationFolder}/%03d.${file.destinationFormat}`)
			.on('start', () => spinner.start())
			.on('progress', (progress: any) => {
				const percentage = `${Math.ceil(progress.percent)}% done.`;
				spinner.text = `Converting a file to ${file.destinationFormat.toUpperCase()} images : ${percentage}`;
			})
			.on('error', (err: any) => {
				spinner.stop();
				return reject('Could not process video: ' + err.message);
			})
			.on('end', () => {
				spinner.stop();
				let images: Array<string> = Fs.readdirSync(file.destinationFolder);
				Logger.success(`Converted the source file to ${images.length} images.`);
				return resolve(images.map((path: string) => `${file.destinationFolder}/${path}`));
			})
			.run();
	});
}
