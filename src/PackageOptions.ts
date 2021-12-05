import * as core from '@actions/core';
import * as util from './util';

export interface PackageOptions {
    devices: string;
    openwrt_version: string;
    kernel_version: string;
    whoami: string;
    out: string;
    openwrt_path: string;
    openwrt_url: string;
    sub_name: string;
}

export interface Kernels {
    Item: Array<string>
    Latest: string;
    Latest_O: string;
}

export function getPackageOptions() {
    const devices = core.getInput("types", { required: true });
    const openwrt_version = core.getInput("openwrt-version");
    const kernel_version = core.getInput("kernel-version");
    const whoami = core.getInput("whoami");
    const out = core.getInput("out");
    const openwrt_path = core.getInput("openwrt-path");
    const openwrt_url = core.getInput("openwrt-url");
    const sub_name = core.getInput("sub-name");
    const githubrepository = core.getInput("githubrepository");

    if (util.isNull(openwrt_path) && util.isNull(openwrt_url)) {
        core.setFailed(`Both [openwrt-path] and [.openwrt-url] cannot be empty.`);
    }
    return {
        devices,
        openwrt_version,
        kernel_version,
        whoami,
        out,
        openwrt_path,
        openwrt_url,
        sub_name,
        githubrepository
    }
}