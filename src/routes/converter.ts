import { Server, Sequence } from '../types';
import { Request, NextFunction, Response } from 'express';

const Converter: Server.RouteMap = {
	fromFile: (req: Request, res: Response, next: NextFunction): Promise<Array<Sequence>> => {
		return Promise.resolve([]);
	},
	fromURL: (req: Request, res: Response, next: NextFunction): Promise<Array<Sequence>> => {
		return Promise.resolve([]);
	},
};

const ConverterRoutes: Array<Server.Route> = [
	{ method: 'POST', url: '/converter/file', callback: Converter.fromFile },
	{ method: 'POST', url: '/converter/url', callback: Converter.fromURL },
];

export default ConverterRoutes;
