var cluster = require('cluster');

if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    
    var express = require('express');
    var bp = require('body-parser');
    var app = express();
    
    app.use(bp.json());
    app.use(express.static('public'));
    
    var _ = require('underscore');
    var tasks=[];
    
    app.use(express.static('public'));
    
    var taskid=1;
    
    app.get('/getmytasks',(req,res)=>{
        res.json(tasks);
    })
    
    app.get('/getmytasks/:id',(req,res)=>{
        var newid=parseInt(req.params.id);
        console.log(newid);
        var dataFound = _.findWhere(tasks,{id:newid});
            if(dataFound){
                res.json(dataFound);
            }
            else{
                res.json("404 - Data not found");
                res.status(404).send();
                
            }
    });
    
    app.post('/postmytasks',(req,res)=>{
        var data = req.body;
        data.id = taskid++;
        tasks.push(data);
        res.json(tasks);
    })
    
    app.delete('/deletemytasks/:id',(req,res)=>{
        var newid=parseInt(req.params.id,10);
        console.log("delete new id = "+newid);
        var dataFound = _.findWhere(tasks,{id:newid});
            if(dataFound){
                tasks = _.without(tasks,dataFound);
                res.json(dataFound);
            }
            else{
                res.status(404).send("404 | data not found");
            }
    });
    
    app.listen(3000,()=>{
        console.log("Server is started");
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    })
    
}