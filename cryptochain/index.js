const Block = require('../blockchain/block');
const Blockchain = require('../blockchain');
const express = require('express');
const bodyParser = require('body-parser');
const PubSub = require('../app/pubsub');
const request = require('request');

const blockchain = new Blockchain();
const pubSub = new PubSub({blockchain});
const app = express();
const DEFAULT_PORT = 3000;
const DEFAULT_URL = `http://localhost:${DEFAULT_PORT}`;

//code to sync the chains when peer port is used
const syncChains = () =>{
	request({url:`${DEFAULT_URL}/api/blocks`}, (error, response, body)=>{
		if(!error && response.statusCode===200){
			console.log("Replacing the chain with root chain");
			const rootChain = JSON.parse(response.body);
			blockchain.replace_chain(rootChain);
		}
	});
};

//Use the body-parser middleware to parse incoming JSON for PUT/POST requests.
app.use(bodyParser.json());

//get the blockchain
app.get('/api/blocks', (req, res)=>{
	res.json(blockchain.chain);
});

//mine the block
app.post('/api/mine', (req,res)=>{
	const {data} = req.body;
	blockchain.add_block({data});
	pubSub.publish('BLOCKCHAIN', JSON.stringify(blockchain.chain));
	res.redirect('/api/blocks');
});

let PEER_PORT;
if (process.env.PEER_PORT==='true'){
	PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, ()=>{
	console.log(`Listening on port ${PORT}`);
	if (PORT!==DEFAULT_PORT){
		syncChains();
	}
});