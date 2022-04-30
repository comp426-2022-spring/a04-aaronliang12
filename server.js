const express = require("express")
const app = express()
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))

const port = argv["port"] || 5000

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