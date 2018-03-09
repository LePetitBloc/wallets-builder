const { Observable } = require('rxjs/Observable');
const { spawn } = require('child_process');
const readline = require('readline');
const chalk = require('chalk');

const spawnObservable = (command, args = []) => {
    const spawnee = spawn(command, args);

    return Observable.create((observer) => {
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
                observer.complete();
            } else {
                observer.error(new Error(`child process exited with code ${code}`));
            }
        });
    });
};

module.exports = spawnObservable;