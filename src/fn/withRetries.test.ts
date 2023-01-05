import { assert } from 'chai';
import { withRetries } from './withRetries';

describe('withRetries', () => {
    it('should retry 3 times and error', async () => {
        let tries = 0;

        await withRetries(async () => {
            tries++;
            throw new Error('');
        }, { retries: 3 }).catch(() => { });

        assert.equal(tries, 4);
    });
    it('should retry 3 times and succeed', async () => {
        let tries = 0;

        await withRetries(async () => {
            tries++;

            if (tries !== 4) {
                throw new Error('');
            }
        }, { retries: 3 });

        assert.equal(tries, 4);
    });
    it('should retry 3 times and return', async () => {
        let tries = 0;

        const result = await withRetries(async () => {
            tries++;

            if (tries !== 4) {
                throw new Error('');
            } else {
                return 15;
            }
        }, { retries: 3 });

        assert.equal(tries, 4);
        assert.equal(result, 15);
    });
});