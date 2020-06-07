import { Server, Sequence } from '../types';
import { Request, NextFunction, Response } from 'express';

const SequenceMethods: Server.RouteMap = {
	get: (req: Request, res: Response, next: NextFunction): Promise<Array<Sequence>> => {
		return Promise.resolve([]);
	},
};

const SequenceRoutes: Array<Server.Route> = [
	{ method: 'GET', url: '/sequences', callback: SequenceMethods.get },
];

export default SequenceRoutes;
