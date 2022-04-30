const express = require('express')

const db = require("./database.js")
const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const morgan = require('morgan')
const fs = require('fs')

const http = require('http')

const args = require('minimist')(process.argv.slice(2))
//console.log(args)

//port
const port = args.port || process.env.PORT || 5000 

args['port', 'help', 'debug', 'log']

//help
const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}



//lg const
const log = args.log || true

if (log == true) {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
  app.use(morgan('accesslog', { stream: accessLog }))
}

// logging

app.use((req, res, next) => {

    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers["referer"],
        useragent: req.headers["user-agent"],
    };
  
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  
    next();
  });

  //debug const
const debug = args.debug || false

if (debug == true) {
  app.get('/app/log/access', (req, res) => {
      const stmt = db.prepare("SELECT * FROM accesslog").all();
      res.status(200).json(stmt);
  });
  app.get('/app/error', (req, res) => {
      throw new Error('Error Test Successful.');
  });
}



//code from a03
const {coinFlip, coinFlips, countFlips, flipACoin} = require("./modules/coin.js");


// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});



app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
    });


// Endpoint returning JSON of flip function result
app.get('/app/flip', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.json({flip:coinFlip()})
});

// Endpoint returning JSON of flip array & summary
app.get('/app/flips/:number', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';

    var flips = coinFlips(req.params.number)
    var summary = countFlips(flips)

    res.status(200).json({"raw" : flips, "summary" : countFlips(flips)})
});

app.get('/app/flip/call/heads', (req, res) => {
    res.statusCode = 200;
    let answer = flipACoin('heads')
    res.send(answer)
    res.writeHead(res.statusCode, {'Content-Type': 'text/plain'});
})

app.get('/app/flip/call/tails', (req, res) => {
    res.statusCode = 200;
    let answer = flipACoin('tails')
    res.send(answer)
    res.writeHead(res.statusCode, {'Content-Type': 'text/plain'});
})

app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});