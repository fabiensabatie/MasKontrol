import { Convert } from '../../src/use-cases/sequence';
import { Sequence } from '../../src/entities/converter/sequences';

describe('Sequences', () => {
    it('should convert a youtube video', async () => {
        const Options = {
            name: 'Trance',
            Files: {
                sources: 'https://www.youtube.com/watch?v=NeQM1c-XCDc',
                destinationFormat: 'seq',
                destinationFolder: '/Users/fabiensabatie/Movies/testing/wow/hehe',
            },
            Dimensions: {
                width: 43,
                height: 26,
            }
        };

        const converted = await Convert(new Sequence(Options));
        expect(converted).toBe("/Users/fabiensabatie/Movies/testing/wow/hehe/Trance.seq");
    })
})