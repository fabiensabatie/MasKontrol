import Sequence from '../entities/converter';

export async function Convert(sequence: Sequence) {
    return await sequence.convert();
};

