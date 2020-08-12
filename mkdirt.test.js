const os = require('os');
const fs = require('fs');
const util = require('util');
const path = require('path');
const mkdirt = require('./mkdirt');

const stat = util.promisify(fs.stat);
const rmdir = util.promisify(fs.rmdir);
const chmod = util.promisify(fs.chmod);
const unlink = util.promisify(fs.unlink);
const mkdtemp = util.promisify(fs.mkdtemp);
const writeFile = util.promisify(fs.writeFile);

function fix(fullpath) {
    return path.normalize(fullpath);
}

async function isDirectory(path) {
    try {
        return (await stat(path)).isDirectory();
    } catch (error) { /* silence is golden */ }
    return false;
}

describe('mkdirt', () => {

    let tmp = null;
    let pwd = null;

    beforeAll(async () => {
        tmp = await mkdtemp(path.join(os.tmpdir(), 'mkdirt-'));
        pwd = process.cwd();
    });

    describe('relative paths', () => {

        beforeAll(() => {
            process.chdir(tmp);
        });

        it('should correctly create relative directory trees', async () => {
            expect(await isDirectory('x')).toBe(false);
            await mkdirt(fix('x/y/z'));
            expect(await isDirectory('x')).toBe(true);
            expect(await isDirectory(fix('x/y'))).toBe(true);
            expect(await isDirectory(fix('x/y/z'))).toBe(true);
            await rmdir(fix('x/y/z'));
            await rmdir(fix('x/y'));
            await rmdir('x');
        });

        it('should throw when invalid paths are given', async () => {
            expect(await isDirectory('a')).toBe(false);
            await mkdirt(fix('a/b/c'));
            expect(await isDirectory(fix('a/b/c'))).toBe(true);
            await writeFile(fix('a/b/c/d'), Buffer.from(''));
            await expect(mkdirt(fix('a/b/c/d/e'))).rejects.toThrow();
            await unlink(fix('a/b/c/d'));
            await rmdir(fix('a/b/c'));
            await rmdir(fix('a/b'));
            await rmdir('a');
        });

        it('should throw when creating a directory fails', async () => {
            expect(await isDirectory('i')).toBe(false);
            await mkdirt(fix('i/j/k'));
            expect(await isDirectory(fix('i/j/k'))).toBe(true);
            await chmod(fix('i/j/k'), 0o555);
            await expect(mkdirt(fix('i/j/k/x'))).rejects.toThrow();
            await rmdir(fix('i/j/k'));
            await rmdir(fix('i/j'));
            await rmdir('i');
        });

        afterAll(() => {
            process.chdir(pwd);
        });

    });

    describe('absolute paths', () => {

        it('should correctly create absolute directory trees', async () => {
            expect(await isDirectory(tmp + fix('/x'))).toBe(false);
            await mkdirt(tmp + fix('/x/y/z'));
            expect(await isDirectory(tmp + fix('/x'))).toBe(true);
            expect(await isDirectory(tmp + fix('/x/y'))).toBe(true);
            expect(await isDirectory(tmp + fix('/x/y/z'))).toBe(true);
            await rmdir(tmp + fix('/x/y/z'));
            await rmdir(tmp + fix('/x/y'));
            await rmdir(tmp + fix('/x'));
        });

        it('should throw when invalid paths are given', async () => {
            expect(await isDirectory(tmp + fix('/a'))).toBe(false);
            await mkdirt(tmp + fix('/a/b/c'));
            expect(await isDirectory(tmp + fix('/a/b/c'))).toBe(true);
            await writeFile(tmp + fix('/a/b/c/d'), Buffer.from(''));
            await expect(mkdirt(tmp + fix('/a/b/c/d/e'))).rejects.toThrow();
            await unlink(tmp + fix('/a/b/c/d'));
            await rmdir(tmp + fix('/a/b/c'));
            await rmdir(tmp + fix('/a/b'));
            await rmdir(tmp + fix('/a'));
        });

        it('should throw when creating a directory fails', async () => {
            expect(await isDirectory(tmp + fix('/i'))).toBe(false);
            await mkdirt(tmp + fix('/i/j/k'));
            expect(await isDirectory(tmp + fix('/i/j/k'))).toBe(true);
            await chmod(tmp + fix('/i/j/k'), 0o555);
            await expect(mkdirt(tmp + fix('/i/j/k/x'))).rejects.toThrow();
            await rmdir(tmp + fix('/i/j/k'));
            await rmdir(tmp + fix('/i/j'));
            await rmdir(tmp + fix('/i'));
        });

    });

    afterAll(async () => {
        await rmdir(tmp);
    });

});
