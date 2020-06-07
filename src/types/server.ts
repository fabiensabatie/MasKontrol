import { Request, Response, NextFunction } from 'express';

export namespace Server {
	export type RouteCallback = (req: Request, res: Response, next: NextFunction) => Promise<any>;

	export type RouteMap = { [methodName: string]: RouteCallback };

	export interface Route {
		method: 'POST' | 'GET' | 'PUT' | 'DELETE';
		url: string;
		callback: RouteCallback;
	}

	export type CustomRequest = Request & {
		response?: any;
	};

	export type CustomResponse = {
		data: any;
		errors: any;
	};

	export type Options = {
		middlewares: Array<Server.RouteCallback>;
		port: number;
		routes: Array<Server.Route>;
	};
}
