import Chalk from 'chalk';

const enum LEVELS {
	VERBOSE = 0,
	DEBUG = 1,
	INFO = 2,
	WARNING = 3,
	ERROR = 4,
}

const Logger = {
	debug: (message: any) => process.env.DEBUG && Logger.log(message, LEVELS.VERBOSE),
	info: (message: any) => Logger.log(message, LEVELS.VERBOSE, 'blue'),
	success: (message: any) => Logger.log(message, LEVELS.VERBOSE, 'green'),
	warn: (message: any) => Logger.log(message, LEVELS.VERBOSE, '#ff9c26'),
	error: (message: any) => Logger.log(message, LEVELS.VERBOSE, 'red'),
	log: (message: any, level: LEVELS = LEVELS.VERBOSE, color: string = 'white') => {
		if (!message) return;
		// if (message instanceof Error) message = JSON.stringify(message, null, '\t');
		// else if (typeof message === 'object') message = JSON.stringify(message, null, '\t');

		let datedMessage = `[ ${new Date().toDateString()} ] ` + message;
		// @ts-ignore
		if (!Chalk[color]) {
			message = Chalk.hex(color)(datedMessage);
			color = 'white';
		}
		// @ts-ignore
		console.log(Chalk[color](datedMessage));
	},
};

export default Logger;
