const { mkdir, stat, constants } = require('fs');
const { dirname } = require('path');

/**
 * Constants
 */

const PROBE_OK = 1 << 0;
const PROBE_DONE = 1 << 1;

/**
 * Interface
 */

/**
  * Make Directory Tree
  *
  * @param {string} path The path to the directory being created (parent directories will be created recursively)
  * @param {number} mode The file mode number to be assigned to the directories being created
  */
async function mkdirt(path, mode) {
    const parent = dirname(path);
    if (parent !== path) {
        await mkdirt(parent, mode);
    }
    const result = await probe(path);
    if (!(result & PROBE_OK)) {
        throw new Error('Cannot create directory tree');
    }
    if (!(result & PROBE_DONE)) {
        await mkdirs(path, mode);
    }
}

/**
 * Helpers
 */

async function mkdirs(path, mode) {
    const { reject, resolve, promise } = defer();
    mkdir(path, mode, async function (error) {
        if (error !== null && typeof error === 'object') {
            reject(new Error(`Error creating directory "${path}": ${error.code}`));
        } else {
            resolve(true);
        }
    });
    return await promise;
}

async function probe(path) {
    const { resolve, promise } = defer();
    stat(path, function (error, stats) {
        let result = 0;
        if (error !== null && typeof error === 'object') {
            if (error.code === 'ENOENT') {
                result = PROBE_OK;
            }
        } else if ((stats.mode & constants.S_IFMT) === constants.S_IFDIR) {
            result = PROBE_OK | PROBE_DONE;
        }
        resolve(result);
    });
    return await promise;
}

function defer() {
    let reject, resolve, promise = new Promise(function (res, rej) {
        reject = rej;
        resolve = res;
    });
    return Object.freeze({ reject, resolve, promise });
}

/**
 * Exports
 */

module.exports = mkdirt;
