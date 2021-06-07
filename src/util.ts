import * as core from '@actions/core';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import * as glob from '@actions/glob';
import * as io from '@actions/io';
import * as axios from 'axios';


export function getBooleanInput(inputName: string, defaultValue: boolean = false) {
    return (core.getInput(inputName) || String(defaultValue)).toUpperCase() === 'TRUE';
}

export function isNull(a: any) {
    return typeof a === 'string' && (a === null || a === '');
}

function getDefaultCopyOptions(): io.CopyOptions {
    return {
        recursive: true,
        force: true
    }
}
export async function readFile(filePath: string) {
    return await fs.promises.readFile(filePath, 'utf8');
}
export async function writeFile(file: string, data: string) {
    await io.rmRF(file);
    await fs.promises.writeFile(file, data);
}
export function splitLines(t: string) {
    return t.split(/\r\n|\r|\n/);
}

export async function copy(source: string, dest: string) {
    if (fs.existsSync(source)) {
        await io.cp(source, dest, getDefaultCopyOptions());
    } else {
        throw Error(`${source} is not exists.`);
    }
}
function getDefaultGlobOptions(): glob.GlobOptions {
    return {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true
    }
}
export async function get<T = any>(url: string) {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    return await axios.default.get<T>(url, {
        httpsAgent: httpsAgent
    });
}


export async function download(fileUrl: string, filePath: string) {

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        let fileInfo: any = null;

        var url = require('url');
        // var HttpsProxyAgent = require('https-proxy-agent');
        var options = url.parse(fileUrl);

        // var proxy = '';
        // var agent = new HttpsProxyAgent(proxy);
        // options.agent = agent;

        const request = https.get(options, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${options.toString()}' (${response.statusCode})`));
                return;
            }

            fileInfo = {
                mime: response.headers['content-type'],
                size: parseInt(String(response.headers['content-length']), 10),
            };

            response.pipe(file);
        });

        file.on('finish', () => resolve(fileInfo));

        request.on('error', err => {
            fs.unlink(filePath, () => reject(err));
        });

        file.on('error', err => {
            fs.unlink(filePath, () => reject(err));
        });

        request.end();
    });
}

export async function fileExist(path: string) {
    try {
        await fs.accessSync(path)
        return true
    } catch {
        return false
    }
}
export async function getOpenWrtFilePaths(searchPath: string) {
    const patterns = path.join(searchPath, '*.tar.gz');
    console.log(patterns);
    const globber = await glob.create(patterns, getDefaultGlobOptions())
    const files = await globber.glob()
    files.forEach(item => {
        console.log(item);
    });
    return files;
}

