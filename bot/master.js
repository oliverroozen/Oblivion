const cluster = require('cluster');

if (cluster.isMaster) {
    console.log('-----------------\nMaster initiated!');
    
    cluster.setupMaster({
        exec: 'bot.js',
        args: [],
        silent: false
    });
    console.log('Staring bot...');
    cluster.fork();
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} closed.`);
    });
    
    cluster.on('message', function(worker, message, handle) {
        if (message == 'shutdown') {
            worker.kill('SIGINT');
        } else if (message == 'restart') {
            worker.kill('SIGINT');
            worker.on('disconnect', () => {
                cluster.fork();
            });
        }
    });
} else {
  
}




