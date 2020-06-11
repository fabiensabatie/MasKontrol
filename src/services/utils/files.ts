import Fs from 'fs';
import Logger from './logger';

const Folders = {
	getOrCreate: async (path: string): Promise<void> => {
		if (!Fs.existsSync(path)) {
			Logger.info('Creating the folder : ' + path);
			Fs.mkdirSync(path);
		}
	},
};

export { Folders };
