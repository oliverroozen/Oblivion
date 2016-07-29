const cluster = require('cluster');

if (cluster.isMaster) {
    console.log('-----------------\n[M] Master initiated!');
    
    cluster.setupMaster({
        exec: 'bot/bot.js',
        args: [],
        silent: false
    });
    console.log('[M] Staring bot...');
    cluster.fork();
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`[M] Worker ${worker.process.pid} closed.`);
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
}




