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
    var MongoClient = require('mongodb').MongoClient;
    var db

    MongoClient.connect('mongodb://admin:admin@ds131826.mlab.com:31826/poondb',(err,database)=>{
        if(err) return console.log(err);
        db=database;
    })

    app.use(express.static('public'));
    
    var taskid=1;
    /*
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
    });*/
    
    app.get("/getdata",(req,res)=>{
        db.collection('employeedb').find().toArray((err,result)=>{
            if(err) return console.log(err)

            res.json(result);
        })
    })
    app.post('/postmytasks',(req,res)=>{
        /*var data = req.body;
        data.id = taskid++;
        tasks.push(data);
        res.json(tasks);*/
        db.collection('employeedb').save(req.body,(err,result)=>{
            if(err) return console.log(err)
                console.log('saved to database')
            res.json("req.body");
        })
    })
    
    app.delete('/deletedata',(req,res)=>{
        /*var newid=parseInt(req.params.id,10);
        console.log("delete new id = "+newid);
        var dataFound = _.findWhere(tasks,{id:newid});
            if(dataFound){
                tasks = _.without(tasks,dataFound);
                res.json(dataFound);
            }
            else{
                res.status(404).send("404 | data not found");
            }*/
            console.log("in deletedata")
            db.collection('employeedb').findOneAndDelete({name:req.body.name},(err,result)=>{
                if(err) return res.send(500,err)
                    res.send('record deleted')
            })
    });
    
    app.put('/updatedata',(req,res)=>{
        db.collection('employeedb')
        .findOneAndUpdate({taskname:req.body.taskname},
            {
            $set: {
                taskname:req.body.taskname,
                status:req.body.status
            }
        }, 
        {
            sort: {_id:-1},
            upsert: true
        }, (err,result) => {
            if(err) return res.send(err)
            res.send(result)
        })
    })
    app.listen(3000,()=>{
        console.log("Server is started");
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    })
    
}