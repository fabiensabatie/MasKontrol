import Fs from 'fs';
import Path from 'path';
import Logger from './logger';

const Folders = {
	getOrCreate: async (path: string): Promise<void> => {
		if (!Fs.existsSync(path)) {
			await Fs.promises.mkdir(path, { recursive: true });
			path.indexOf(process.env.TMP_FOLDER || 'tmp') >= 0
				? Logger.info('Successfully created a temporary folder.')
				: Logger.info('Successfully created the folder : ' + path);
		}
	},

	empty: async (path: string): Promise<void> => {
		try {
			if (Fs.existsSync(path)) {
				Fs.readdirSync(path).forEach((file) => {
					const curPath = Path.join(path, file);
					Fs.lstatSync(curPath).isDirectory() ? Folders.empty(curPath) : Fs.unlinkSync(curPath);
				});
				Fs.rmdirSync(path);
			}
		} catch (err) {
			Logger.warn('The temporary folder could not be emptied.');
		}
	},
};

export { Folders };
