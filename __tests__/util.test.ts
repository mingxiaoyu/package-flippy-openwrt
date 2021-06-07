import * as  fs from 'fs'
import * as io from '@actions/io'
import * as core from '@actions/core'
import * as path from 'path'
import { getOpenWrtFilePaths, download, fileExist, copy } from '../src/util'

const root = path.join(__dirname, '_temp')

describe('util test', () => {
    beforeAll(async () => {
        await io.mkdirP(root);
    });
    afterAll(async () => {
        await io.rmRF(root);
    });

    it('getOpenWrtFilePaths', async () => {
        await fs.promises.writeFile(path.join(root, 'test.tar.gz'), 'tar.gz file');
        const files = await getOpenWrtFilePaths(root);
        expect(files.length).toEqual(1);
    })

    // it('donwload file', async () => {
    //     await download('https://gitee.com/solidsnake2007/Case2Pinyin/raw/master/README.md', path.join(root, 'd.txt'));
    //     let exist = await fileExist(path.join(root, 'd.txt'));
    //     expect(exist).toEqual(true);
    // })

    it('copy test', async () => {
        let sourceP = path.join(__dirname, 'sourceP')
        await io.mkdirP(sourceP);
        await fs.promises.writeFile(path.join(sourceP, 'test.tar.gz'), 'tar.gz file');
        await copy(sourceP, path.join(root, 'sourceP'))
        let exist = await fileExist(path.join(root, 'sourceP', 'test.tar.gz'))
        expect(exist).toEqual(true);
        await io.rmRF(sourceP);

    });
});

