import YTDL from 'ytdl-core';
import Ora from 'ora';
import { ConverterTypes } from '../../types';
import Fs from 'fs';
import Logger from '../utils/logger';
import { Folders } from '../utils/files';

const Youtube = {
	download: async (File: ConverterTypes.Files): Promise<string> => {
		await Folders.getOrCreate(File.destinationFolder);
		return new Promise(async (resolve, reject) => {
			if (typeof File.sources !== 'string')
				return reject('The source must be a valid YouTube video URL.');

			const source: string = File.sources;
			const spinner = Ora({
				color: 'green',
				text: `Downloading a video from YouTube : ${File.sources}`,
				spinner: 'bouncingBall',
			}).start();

			YTDL.getInfo(source, async (err, info) => {
				if (err) return reject(err);
				let path: string = `${File.destinationFolder}/${info.title}.${File.destinationFormat}`;
				YTDL(source, { filter: (format) => format.container === File.destinationFormat })
					.pipe(Fs.createWriteStream(path, { emitClose: true }))
					.on('finish', () => {
						spinner.stop();
						Logger.success(`Downloaded the video : ${path}`);
						return resolve(path)
					})
					.on('error', (err) => {
						spinner.stop();
						reject(err);
					})
					.on('close', () => {
						spinner.stop();
						resolve(path);
					});
			});

		});
	},
};

export default Youtube;
// Youtube.download({
// 	sources: 'https://www.youtube.com/watch?v=xw3C03Ba8Dk',
// 	destinationFormat: 'mp4',
// 	destinationFolder: '/Users/fabiensabatie/Movies',
// }).catch(console.log);
