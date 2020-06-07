/* Libraries */
import Express, { Request, Response, NextFunction } from 'express';
import Cors from 'cors';
import BodyParser from 'body-parser';
import HTTP from 'http';
import { Server } from './types';

export class CustomResponse {
	private _data: any = {};
	private _errors: any = [];
	private _res: Response;
	private _statusCode: number = 200;

	constructor(res: Response) {
		this._res = res;
	}

	add(key: string, data: any) {
		this._data[key] = data;
	}

	error(error: any, code: number = 400) {
		this._errors.push(error);
		this._statusCode = code;
	}

	send() {
		let response: Server.CustomResponse = {
			data: this._data,
			errors: this._errors.length === 1 ? this._errors[0] : this._errors,
		};
		return this._res.status(this._statusCode).send(response);
	}
}

export class WebServer {
	private _port: number = 8000;
	private _app = Express();
	private _middlewares: Array<Server.RouteCallback> = [];
	private _server = HTTP.createServer(this._app);
	private _routes: Array<Server.Route> = [];

	constructor(options: Server.Options) {
		this._port = options.port;
		this._routes = options.routes;
		this._middlewares = options.middlewares;

		this._app.use(Cors());
		this._app.use(BodyParser.json({ limit: '20mb' }));
		this._app.use(BodyParser.urlencoded({ extended: true, limit: '20mb' }));
		this._app.use((req: Server.CustomRequest, res: Response, next: NextFunction) => {
			// Setup CORS
			res.setHeader('Access-Control-Allow-Credentials', 'true');
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
			res.setHeader(
				'Access-Control-Allow-Headers',
				'X-Requested-With, content-type, Authorization, Accept, X-Access-Token, X-Application-Name, X-Request-Sent-Time'
			);

			// Init response object
			req.response = new CustomResponse(res);

			next();
		});

		// Setup middlewares
		this._middlewares.map((middleware: Server.RouteCallback) => this._app.use(middleware));

		// Setup routes
		this._app.use((req: Request, res: Response, next: NextFunction) => {
			console.log(req);
			res.send('OK');
		});
	}

	start() {
		this._app.set('port', this._port);
		this._server.listen();
		console.log('Server is listening on port', this._port);
	}
}
