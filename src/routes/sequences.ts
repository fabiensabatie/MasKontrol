import { Server, Sequence } from '../types';
import { Request, NextFunction, Response } from 'express';

const SequenceMethods: Server.RouteMap = {
	geto: (req: Request, res: Response, next: NextFunction): Promise<Array<Sequence>> => {
		return Promise.resolve([]);
	},
};

const SequenceRoutes: Array<Server.Route> = [
	{ method: 'GET', url: '/sequences', callback: SequenceMethods.geto },
];

export default SequenceRoutes;
