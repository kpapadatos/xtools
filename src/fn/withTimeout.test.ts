import { expect } from 'chai';
import { sleep } from './sleep';
import { TimeoutError, withTimeout } from './withTimeout';

describe('withTimeout', () => {
    it('should complete before timeout', async () => {
        const result = await withTimeout(async () => 1, { timeoutMs: 10 });
        expect(result).eq(1);
    });
    it('should error before timeout', async () => {
        const result = await withTimeout(async () => {
            await sleep(1);
            throw new Error();
        }, { timeoutMs: 10 }).catch(e => e);
        expect(result).instanceOf(Error);
    });
    it('should error with timeout', async () => {
        const timeoutMs = 10;
        const result = await withTimeout(async () => {
            await sleep(timeoutMs + 10);
        }, { timeoutMs }).catch(e => e);
        expect(result).instanceOf(TimeoutError);
    });
});