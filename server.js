const express = require("express")
const app = express()
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const db = require("./database.js")
const port = argv["port"] || 5000

args['port', 'help', 'debug', 'log']
console.log(args)
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
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

function coinFlip() {
	var randInt = Math.floor(Math.random()*2);
	if(randInt == 1){
	  return "heads";
	}
	return "tails";
  }

  function coinFlips(flips) {
    let array = [];
    for (let i = 0; i < flips; i++) {
      array.push(coinFlip());
    }
    return array;
}

  function countFlips(array) {
	let countResult = {heads: 0, tails: 0}
	for(let i = 0; i < array.length; i++){
	  if(array[i] == "heads"){
		countResult.heads +=1; 
	  }
	  else{
		countResult.tails +=1;
	  }
	}
	return countResult;
 }

 function flipACoin(call) {
	var flipRes = coinFlip();
	var result = "";
	if(call == flipRes){
	  result = "win";
	}
	else{
	  result = "lose";
	}
	return {call: call, flip: flipRes, result: result};
  }


const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

app.get("/app/", (req,res) => {
    res.statusCode = 200
    res.statusMessage = "ok"
    res.writeHead(res.statusCode, {"Content-Type": "text/plain"})
    res.end(res.statusCode + " " + res.statusMessage)
})

app.get("/app/flip/", (req, res) => {
    var flip = coinFlip()
    return res.status(200).json({"flip" : flip})
})

app.get('/app/flips/:number', (req, res) => {
    const raw = coinFlips(req.params.number);
    const summary = countFlips(raw);
    res.status(200).json({
        "raw": raw,
        "summary": summary
    });
});


app.get("/app/flip/call/heads", (req, res) => {
    return res.status(200).json(flipACoin("heads"))
})

app.get("/app/flip/call/tails", (req,res) => {
    return res.status(200).json(flipACoin("tails"))
})
app.use(function(req,res){
    res.status(404).send("404 NOT FOUND")
})