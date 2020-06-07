import * as Dotenv from 'dotenv';
import { WebServer } from './server';
import Routes from './routes';

Dotenv.config(); // Fetches the .env file
Dotenv.config({
	path:
		process.env.ENV === 'production'
			? `${__dirname}/../../.env.production`
			: `${__dirname}/../../.env.development`,
});

const Server = new WebServer({
	port: 9000,
	middlewares: [],
	routes: Routes,
}).start();
