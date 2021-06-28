import * as fs from 'fs'
import * as io from '@actions/io'
import * as core from '@actions/core'
import * as exec from '@actions/exec';
import * as path from 'path'
import { create_make_env, getFolders, getKernel, getKernels, getOpenwrtver } from '../src/setup-files'
import { PackageOptions } from '../src/PackageOptions';
import * as util from '../src/util';

import { mock } from 'jest-mock-extended';


const root = path.join(__dirname, '_temp')

describe('setup files test', () => {
    beforeAll(async () => {
        await io.mkdirP(root);
    });
    afterAll(async () => {
        await io.rmRF(root);
    });

    it('getKernels', async () => {
        let data = [
            "5.10.36-flippy-58",
            "5.12.8-flippy-59",
            "5.4.113-flippy-57-o",
            "5.4.115-flippy-57-o",
            "5.12.13-flippy-61"
        ]
        let kernels = getKernels(data);
        expect(kernels.Latest_O).toBe("5.4.115-flippy-57+o")
        expect(kernels.Latest).toBe("5.12.13-flippy-61+")

    });

    it('create_make_env', async () => {
        let packageOptions = mock<PackageOptions>();
        packageOptions.kernel_version = '5.12.8-flippy-59+';
        packageOptions.whoami = "mingxiaoyu"
        packageOptions.openwrt_version = 'R21.6.1'
        await create_make_env(packageOptions, path.join(root, 'make.env'));

        const data = await util.readFile(path.join(root, 'make.env'))
        expect(data).toContain(`WHOAMI="${packageOptions.whoami}"`);
        expect(data).toContain(`OPENWRT_VER="${packageOptions.openwrt_version}"`);
        expect(data).toContain(`KERNEL_VERSION="${packageOptions.kernel_version}"`);

        let read_data = await getOpenwrtver(path.join(root, 'make.env'));
        expect(read_data).toBe("R21.6.1");
    });

    it('getKernel test', async () => {
        let spyexec = jest.spyOn(exec, 'exec');

        let kernelPath = path.join(root, 'kernel');
        spyexec.mockImplementation(async (commandLine: string) => {
            await io.mkdirP(kernelPath);
            return 1;
        });

        let spycopy = jest.spyOn(util, 'copy');
        spycopy.mockImplementation(async () => { });

        await getKernel('5.4.123-flippy-59+o');
        expect(spyexec).toHaveBeenCalled();
        let exist = fs.existsSync(kernelPath)
        expect(exist).toEqual(true);
        await io.rmRF(kernelPath);
    })
})
