const { spawn } = require('child_process');
const readline = require('readline');
const chalk = require('chalk');

const spawnPromise = (command, args = []) => {
    const spawnee = spawn(command, args);

    return new Promise((resolve, reject) => {
        readline
            .createInterface({ input: spawnee.stdout, terminal: false })
            .on('line', line => console.log(chalk`{white ${line}}`))
        ;

        readline
            .createInterface({ input: spawnee.stderr, terminal: false })
            .on('line', line => console.error(chalk`{red ${line}}`))
        ;

        spawnee.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`child process exited with code ${code}`));
            }
        });
    });
};

module.exports = spawnPromise;