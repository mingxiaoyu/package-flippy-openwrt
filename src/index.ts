import * as path from 'path';
import * as io from '@actions/io';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as util from './util';

import { DRIVERS_DICT, KERNEL_PATH, MAKEENV_FILE_NAME, OPENWRT_PACKAGE_TMP, OPENWRT_SCRIPT_PATH, UPDATE_FILE_NAME, UPDATE_FILE_PAHT } from "./constants";
import { getPackageOptions } from "./PackageOptions";
import { create_make_env, getFolders, getKernel, getKernels, getOpenWrtFromFolder, getOpenWrtFromUrl, getOpenwrtver, getPakcageScript, getPakcageScriptFromFlippy } from "./setup-files";

async function clear() {
    await io.rmRF(OPENWRT_SCRIPT_PATH);
    await io.rmRF(KERNEL_PATH);
}
export async function getPackageCommand(diverName: string) {
    return String(DRIVERS_DICT[diverName]);
}

async function run() {
    core.setOutput("status", false);
    let packageOptions = getPackageOptions();

    let github_Folders = await getFolders();
    let Kernels = getKernels(github_Folders);

    if (util.isNull(packageOptions.kernel_version) || packageOptions.kernel_version.toLowerCase() === 'latest') {
        packageOptions.kernel_version = Kernels.Latest_O;
    }
    if (packageOptions.kernel_version.toLowerCase() === 'latest+') {
        packageOptions.kernel_version = Kernels.Latest;
    }
    if (!Kernels.Item.includes(packageOptions.kernel_version)) {
        core.setFailed(`${packageOptions.kernel_version} is not correct`);
    }

    await getKernel(packageOptions.kernel_version);

    await getPakcageScript();

    await io.mkdirP(OPENWRT_PACKAGE_TMP);
    await exec.exec(`sudo chmod  -R 777 ${OPENWRT_SCRIPT_PATH}`);
    await exec.exec(`sudo mkdir -p ${packageOptions.out}`);
    await exec.exec(`sudo chmod  -R 777 ${packageOptions.out}`);

    if (util.isNull(packageOptions.openwrt_version)) {
        let makeenvPath = path.join(OPENWRT_SCRIPT_PATH, MAKEENV_FILE_NAME);
        if (await util.fileExist(makeenvPath)) {
            let opv = await getOpenwrtver(makeenvPath);
            packageOptions.openwrt_version = opv;
        }
    }

    util.info(JSON.stringify(packageOptions));

    await create_make_env(packageOptions, path.join(OPENWRT_SCRIPT_PATH, MAKEENV_FILE_NAME));
    if (!util.isNull(packageOptions.openwrt_path)) {
        await getOpenWrtFromFolder(packageOptions.openwrt_path);
    } else {
        await getOpenWrtFromUrl(packageOptions.openwrt_url);
    }
    util.debug("packaging....")
    let devices = packageOptions.devices.split(',');
    await Promise.all(devices.map(async item => {
        let command = await getPackageCommand(item);
        util.debug(`command:${command} cwd: ${OPENWRT_SCRIPT_PATH}`);
        await exec.exec(`sudo ./${command}`, [], { cwd: OPENWRT_SCRIPT_PATH });

        let files = await util.getFiles(`${OPENWRT_PACKAGE_TMP}/*.img`);
        util.debug(`The img count:${files.length}`)
        if (files.length > 0) {
            await util.copy(path.join(UPDATE_FILE_PAHT, UPDATE_FILE_NAME), `${packageOptions.out}/${UPDATE_FILE_NAME}`)
            await Promise.all(files.map(async item => {
                await exec.exec(`sudo gzip ${item}`);
                let basename = path.basename(item).replace('.img', '');
                if (!util.isNull(packageOptions.sub_name)) {
                    await io.mv(`${item}.gz`, path.join(packageOptions.out, `${basename}-${packageOptions.sub_name}.img.gz`));
                }else{
                    await io.mv(`${item}.gz`, path.join(packageOptions.out, `${basename}.img.gz`));
                }
            }));
        }
    }));
    util.debug("packaged.")
    await clear();
    core.setOutput("status", true);

}
run();