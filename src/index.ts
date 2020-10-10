import * as Dotenv from 'dotenv';
import { WebServer } from './entities/server';
import Routes from './routes';
import { Folders } from './entities/utils/files';

/* Load environment variables */
Dotenv.config({ path: `${__dirname}/../environments/.env` }); // Fetches the .env file
Dotenv.config({
	path:
		process.env.ENV === 'production'
			? `${__dirname}/../environments/.env.production`
			: `${__dirname}/../environments/.env.development`,
});

/* Empty temporary folder */
Folders.empty(process.env.TMP_FOLDER || './tmp');

/* Start server */
const Server = new WebServer({
	port: 9000,
	middlewares: [],
	routes: Routes,
}).start();
