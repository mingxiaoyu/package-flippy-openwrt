import * as core from '@actions/core';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import * as glob from '@actions/glob';
import * as io from '@actions/io';
import * as axios from 'axios';
import * as styles from 'ansi-styles';


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

export function debug(message: string) {
    core.debug(`${styles.default.yellow.open} ${message} ${styles.default.yellow.close}}`);
}

export function info(message: string) {
    core.info(`${styles.default.green.open} ${message} ${styles.default.green.close}}`);
}
export function warning(message: string) {
    core.info(`${styles.default.red.open} ${message} ${styles.default.red.close}}`);
}

export async function copy(source: string, dest: string) {
    if (fs.existsSync(source)) {
        await io.cp(source, dest, getDefaultCopyOptions());
    } else {
        core.setFailed(`${source} is not exists.`)
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

    const response = await axios.default({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream'
    });

    // pipe the result stream into a file on disc
    response.data.pipe(fs.createWriteStream(filePath));

    // return a promise and resolve when download finishes
    return new Promise<void>((resolve, reject) => {
        response.data.on('end', () => {
            resolve()
        })

        response.data.on('error', () => {
            reject()
        })
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
export async function getFiles(patterns: string) {
    const globber = await glob.create(patterns, getDefaultGlobOptions())
    const files = await globber.glob()
    files.forEach(item => {
        debug(item);
    });
    return files;
}
export async function getOpenWrtFilePaths(searchPath: string) {
    if (searchPath.indexOf('$GITHUB_WORKSPACE') >= 0) {
        searchPath = searchPath.replace('$GITHUB_WORKSPACE', process.env.GITHUB_WORKSPACE as string);
    }
    const patterns = path.join(searchPath, '*.tar.gz');
    core.debug(patterns);
    const files = await getFiles(patterns);
    return files;
}

