import { expect } from 'chai';
import { defer } from './defer';

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
        const error = new Error();
        const d = defer();

        expect(d.isFinished).false;

        d.reject(error);

        expect(d.isFinished).true;

        expect(await d.promise.catch(e => e)).eq(error);
    }).timeout(100);
});