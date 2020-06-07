/* Libraries */
import Express, { Request, Response, NextFunction } from 'express';
import Cors from 'cors';
import BodyParser from 'body-parser';
import HTTP from 'http';
import { Server } from '../types';
import Logger from './utils/logger';

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
		let response: Server.CustomResponse = { data: this._data };
		if (this._errors.length) response.errors = this._errors.length === 1 ? this._errors[0] : this._errors;
		return this._res.status(this._statusCode).send(response);
	}
}

export class WebServer {
	private _port: number = 8000;
	private _app = Express();
	private _middlewares: Array<Server.RouteCallback> = [];
	private _server = HTTP.createServer(this._app);
	private _routes: Array<Server.Route> = [];
	private _routesMap: Server.RoutesMap = {};

	constructor(options: Server.Options) {
		/* Setup instance */
		this._port = options.port;
		this._routes = options.routes;
		this._middlewares = options.middlewares;

		/* Setup instance routes */
		this._routes.map((route: Server.Route) => {
			this._routesMap[route.method] = this._routesMap[route.method] || {};
			this._routesMap[route.method][route.url] = route.callback;
		});

		/* Setup default middleware */
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

		// Setup custom middlewares
		this._middlewares.map((middleware: Server.RouteCallback) => this._app.use(middleware));

		// Setup middleware routes
		this._app.use(async (req: Server.CustomRequest, res: Response, next: NextFunction) => {
			if (
				!this._routesMap[req.method] ||
				(this._routesMap[req.method] && !this._routesMap[req.method][req.path])
			) {
				req.response.error('NOT FOUND', 404);
			} else {
				await this._routesMap[req.method][req.path](req, res, next);
			}
			req.response.send();
		});
	}

	start() {
		this._server.listen(this._port);
		Logger.success(`Server is listening on port ${this._port}`);
	}
}
