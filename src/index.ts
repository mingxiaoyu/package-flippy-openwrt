import * as path from 'path';
import * as io from '@actions/io';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as util from './util';
import { DRIVERS_DICT, KERNEL_PATH, MAKEENV_FILE_NAME, OPENWRT_PACKAGE_TMP, OPENWRT_SCRIPT_PATH, UPDATE_FILE_NAME, UPDATE_FILE_PAHT } from "./constants";
import { getPackageOptions } from "./PackageOptions";
import { create_make_env, getFolders, getKernel, getKernels, getOpenWrtFromFolder, getOpenWrtFromUrl, getOpenwrtver, getPakcageScript, getPakcageScriptFromFlippy } from "./setup-files";

async function movefile(distPath: string) {
    await exec.exec(`sudo mkdir -p ${distPath}`);
    await exec.exec(`sudo chmod  -R 777 ${distPath}`);
    await util.copy(path.join(UPDATE_FILE_PAHT, UPDATE_FILE_NAME), `${distPath}/${UPDATE_FILE_NAME}`)
    await util.copy(OPENWRT_PACKAGE_TMP, `${distPath}`);
}

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
        throw new Error(`${packageOptions.kernel_version} is not correct`);
    }

    await getKernel(packageOptions.kernel_version);

    await getPakcageScript();

    await io.mkdirP(OPENWRT_PACKAGE_TMP);
    await exec.exec(`sudo chmod  -R 777 ${OPENWRT_SCRIPT_PATH}`);

    if (util.isNull(packageOptions.openwrt_version)) {
        let makeenvPath = path.join(OPENWRT_SCRIPT_PATH, MAKEENV_FILE_NAME);
        if (await util.fileExist(makeenvPath)) {
            let opv = await getOpenwrtver(makeenvPath);
            packageOptions.openwrt_version = opv;
        }
    }

    console.log(packageOptions);

    await create_make_env(packageOptions, path.join(OPENWRT_SCRIPT_PATH, MAKEENV_FILE_NAME));
    if (!util.isNull(packageOptions.openwrt_path)) {
        await getOpenWrtFromFolder(packageOptions.openwrt_path);
    } else {
        await getOpenWrtFromUrl(packageOptions.openwrt_url);
    }

    let devices = packageOptions.devices.split(',');
    await Promise.all(devices.map(async item => {
        let command = await getPackageCommand(item);
        await exec.exec(`sudo ./${command}`, [], { cwd: OPENWRT_SCRIPT_PATH });
    }));

    await movefile(packageOptions.out);
    await clear();
    core.setOutput("status", true);

}
run();