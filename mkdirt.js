const { mkdir, stat, constants } = require('fs');
const { dirname } = require('path');

/**
 * Constants
 */

const VIABLE = 1 << 0;
const READY = 1 << 1;
const NOT_VIABLE = 0;

/**
 * Interface
 */

async function mkdirt(path, mode) {
    const parent = dirname(path);
    if (parent !== path) {
        await mkdirt(parent, mode);
    }
    const viability = await viable(path);
    if ((viability & VIABLE) !== VIABLE) {
        throw new Error('Cannot create directory tree');
    }
    if ((viability & READY) !== READY) {
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
            reject(new Error(
                `Error creating directory "${path}": ${error.code}`
            ));
        } else {
            resolve(true);
        }
    });
    return await promise;
}

async function viable(path) {
    const { resolve, promise } = defer();
    stat(path, function (error, stats) {
        if (error !== null && typeof error === 'object') {
            resolve(error.code === 'ENOENT' ? VIABLE : NOT_VIABLE);
        } else {
            resolve(
                (stats.mode & constants.S_IFMT) === constants.S_IFDIR
                    ? VIABLE | READY
                    : NOT_VIABLE
            );
        }
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
