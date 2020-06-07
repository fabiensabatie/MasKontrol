import * as Dotenv from 'dotenv';
import { WebServer } from './services/server';
import Routes from './routes';

Dotenv.config({ path: `${__dirname}/../environments/.env` }); // Fetches the .env file
Dotenv.config({
	path:
		process.env.ENV === 'production'
			? `${__dirname}/../environments/.env.production`
			: `${__dirname}/../environments/.env.development`,
});

const Server = new WebServer({
	port: 9000,
	middlewares: [],
	routes: Routes,
}).start();
