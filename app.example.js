const mkdirt = require('./mkdirt');

async function main() {
    try {
        await mkdirt(process.argv[2], 0o775);
        console.log('Done!');
    } catch (error) {
        console.error('Error: %s', error.message);
    }
}

main();
