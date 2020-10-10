import { Server } from '../types';
import { Request, NextFunction, Response } from 'express';

const SequenceMethods: Server.RouteMap = {};

const SequenceRoutes: Array<Server.Route> = [
	// { method: 'GET', url: '/sequences', callback: SequenceMethods.get },
];

export default SequenceRoutes;
