import Fs from 'fs';

const Folders = {
	getOrCreate: async (path: string): Promise<void> => !Fs.existsSync(path) && Fs.mkdirSync(path),
};

export { Folders };
