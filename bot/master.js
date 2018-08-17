const cluster = require('cluster');
var lastCrash = 0;

console.log('-----------------\n[M] Master initiated!');

cluster.setupMaster({
    exec: 'bot/bot.js',
    args: [],
    silent: false
});
console.log('[M] Staring bot...');
cluster.fork();

cluster.on('exit', (worker, code, signal) => {
    if (signal == null) {
        console.log(`[M] Worker ${worker.process.pid} closed.`);
        var time = new Date();
        
        if ((time.getTime() - lastCrash) < 4500) {
            console.log('[M] Bot crashed! Crash loop detected, ending process...');
        } else {
            lastCrash = time.getTime();
            console.log('[M] Bot crashed! Rebooting...');
            cluster.fork();
        }
    }
});

cluster.on('message', function(worker, message, handle) {
    if (message == 'shutdown') {
        console.log('[M] Bot shutdown...');
        worker.kill('SIGINT');
    } else if (message == 'restart') {
        worker.kill('SIGINT');
        worker.on('disconnect', () => {
            console.log('[M] Restarting bot...');
            cluster.fork();
        });
    }
});