import { Server } from '../types';
import { ConvertSequence } from '../controllers/sequences';

const ConverterRoutes: Array<Server.Route> = [
	{ method: 'POST', url: '/convert', callback: ConvertSequence },
	// { method: 'POST', url: '/converter/url', callback: Converter.fromURL },
];

export default ConverterRoutes;
