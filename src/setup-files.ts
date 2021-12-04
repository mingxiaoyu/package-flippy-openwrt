import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as path from 'path';
import * as io from '@actions/io';
import * as util from './util';
import { KERNEL_URL, KERNEL_PATH, CLONE_COMMAND, OPENWRT_SCRIPT_PATH, OPENWRT_FILE_NAME, OPENWRT_PACKAGE_TMP, DEFAULT_JSON, GITHUB_API } from './constants';
import { Kernels, PackageOptions } from './PackageOptions';

export async function getFolders() {
    var res = await util.get<any>(GITHUB_API);
    let result: Array<string> = [];

    res.data.tree.forEach(((item: { type: string; path: string; }) => {
        if (item.type === 'tree' && item.path.includes('flippy')) {
            result.push(item.path);
        }
    }))
    return result;
}

export function getKernels(folers: string[]) {
    let kernels: Kernels = {
        Item: [],
        Latest: "",
        Latest_O: ""
    };
    let max = 0;
    let maxo = 0;
    folers.forEach(item => {
        let version = parseFloat(item.substring(0, 7).replace('.', '').replace('.', ''));
        var kernerName = item.replace("-o", "+o");
        if (item.includes('-o')) {
            kernels.Item.push(kernerName);
            if (maxo < version) {
                maxo = version;
                kernels.Latest_O = kernerName;
            }
        } else {
            kernels.Item.push(kernerName);
            if (max < version) {
                max = version;
                kernels.Latest = kernerName + "+";
            }
        }
    });
    return kernels;
}

export async function getKernel(kernelName: string) {
    let kernamefoldername = kernelName.replace("+o", "-o");
    kernamefoldername = kernamefoldername.replace('+', '');
    let command = `svn co ${KERNEL_URL}/${kernamefoldername}/kernel`;
    await exec.exec(command);
    await util.copy('kernel', KERNEL_PATH);
    await io.rmRF('kernel');
}

export async function getPakcageScript() {
    let command = `svn co ${KERNEL_URL}/opt`;
    await exec.exec(command);
    await util.copy("opt/openwrt", OPENWRT_SCRIPT_PATH);
    await io.rmRF('opt/openwrt');
}

export async function getPakcageScriptFromFlippy() {
    await exec.exec(CLONE_COMMAND);
    await util.copy('openwrt_packit', OPENWRT_SCRIPT_PATH);
    await io.rmRF('openwrt_packit');
}

export async function getOpenWrtFromFolder(filePath: string) {
    util.debug(`get the Opwnwrt from  path: ${filePath}`)
    const files = await util.getOpenWrtFilePaths(filePath);
    if (files.length != 1) {
        files.forEach(item => {
            util.warning(item)
        });
        core.setFailed("OpenWrt should only have one!")
    }
    await util.copy(files[0], path.join(OPENWRT_SCRIPT_PATH, OPENWRT_FILE_NAME));
}
export async function getOpenWrtFromUrl(url: string) {
    util.debug(`get the Opwnwrt from Url: ${url}`)
    await util.download(url, path.join(OPENWRT_SCRIPT_PATH, OPENWRT_FILE_NAME));
}

export async function getOpenwrtver(filePath: string) {
    let data = await util.readFile(filePath);
    let flag = 'OPENWRT_VER="'
    let arrs = util.splitLines(data);
    let result = "";
    arrs.forEach(item => {
        if (item.includes(flag)) {
            result = item.replace(flag, '').replace('"', "")
        }
    });
    return result;

}
export async function create_make_env(options: PackageOptions, file: string) {
    let make_env = `WHOAMI="${options.whoami.trim()}"
OPENWRT_VER="${options.openwrt_version.trim()}"
KERNEL_VERSION="${options.kernel_version.trim()}"
KERNEL_PKG_HOME="/opt/kernel"
function check_k510() {
    K_VER=$(echo "$KERNEL_VERSION" | cut -d '.' -f1)
    K_MAJ=$(echo "$KERNEL_VERSION" | cut -d '.' -f2)

    if [ $K_VER -eq 5 ];then
        if [ $K_MAJ -ge 10 ];then
            K510=1
        else
	    K510=0
        fi
    elif [ $K_VER -gt 5 ];then
        K510=1
    else
        K510=0
    fi
    export K510
}

check_k510
ENABLE_WIFI_K504=1
ENABLE_WIFI_K510=1
SW_FLOWOFFLOAD=1
HW_FLOWOFFLOAD=0
SFE_FLOW=1
if [ $SW_FLOWOFFLOAD -eq 1 ] || [ $K510 -eq 1 ];then
    SFE_FLOW=0
fi`;
    util.debug(make_env);
    await util.writeFile(file, make_env);
}
