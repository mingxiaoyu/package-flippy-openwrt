import { getPackageCommand } from '../src/index';

describe('index files test', () => {
    it('getPackageCommand test', async () => {
        let diver =await getPackageCommand('s905d');
        expect(diver).toEqual('mk_s905d_n1.sh');
    })
})