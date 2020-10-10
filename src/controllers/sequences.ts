import { Convert } from '../use-cases/sequence';
import { Sequence } from '../entities/converter/sequences';
import { Server } from '../types';

export async function ConvertSequence(request: Server.CustomRequest) {
    try {
        const Options = request.body;
        const path = await Convert(new Sequence(Options));
        return (request.response.add({ path }))
    } catch (err) {
        console.log(err)
        return (request.response.error({ error: err }, 500))
    }

}