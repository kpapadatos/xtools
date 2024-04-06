import { expect } from 'chai';
import { defer } from './defer';
import { sleep } from './sleep';

describe('defer', () => {
    it('should resolve with value', async () => {
        const value = {};
        const d = defer();

        expect(d.isFinished).false;

        d.resolve(value);

        expect(d.isFinished).true;

        expect(await d.promise).eq(value);
    }).timeout(100);
    it('should reject with error', async () => {
        let globalError: Error | undefined;
        process.on('unhandledRejection', e => { globalError = e as Error; });
        const error = new Error();
        const d = defer();

        expect(d.isFinished).false;

        d.reject(error);

        expect(d.isFinished).true;

        expect(await Promise.all([d.promise]).catch(e => e)).eq(error);

        await sleep(10);

        expect(globalError).eq(undefined);
    }).timeout(100);
});