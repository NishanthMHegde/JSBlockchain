const Block = require('./blockchain/block');
const Blockchain = require('./blockchain');
const express = require('express');
const bodyParser = require('body-parser');
const PubSub = require('./app/pubsub');
const request = require('request');
const Wallet = require('./wallet/');
const TransactionPool = require('./wallet/transaction-pool');

const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubSub = new PubSub({blockchain, transactionPool});
const TransactionMiner = require('./wallet/transactionminer');
const app = express();
const DEFAULT_PORT = 3000;
const DEFAULT_URL = `http://localhost:${DEFAULT_PORT}`;

const transactionMiner = new TransactionMiner({blockchain, pubSub, wallet, transactionPool});
//code to sync the chains when peer port is used
const syncRootInformation = () =>{
	request({url:`${DEFAULT_URL}/api/blocks`}, (error, response, body)=>{
		if(!error && response.statusCode===200){
			console.log("Replacing the chain with root chain");
			const rootChain = JSON.parse(response.body);
			blockchain.replace_chain(rootChain);
		}
	});

	request({url:`${DEFAULT_URL}/api/get-transaction-map`}, (error, response, body)=>{
		if(!error && response.statusCode===200){
			console.log("Replacing the transactionMap with the root transactionMap");
			const rootTransactionMap = JSON.parse(response.body);
			transactionPool.setTransactionMap(rootTransactionMap);
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

//transaction end point
app.post('/api/transact', (req,res)=>{
	let transaction;
	const {recipient, amount} = req.body;
	transaction = transactionPool.existingTransaction(wallet.publicKey);
	try{
	if (transaction){
		console.log("Transaction exists");
		transaction.update({senderWallet: wallet, recipient:recipient, amount:amount});
	}
	else{
	
	transaction = wallet.createTransaction({recipient:recipient, amount:amount});
	}
}
	catch(error){
		return res.status(400).json({type: "Error", message: "Transaction creation failed"});
	}
	
	transactionPool.setTransaction(transaction);
	pubSub.publish('TRANSACTION', JSON.stringify(transaction));
	res.json({type: "Success", transaction:transaction});
	});

//get the transactionMap
app.get('/api/get-transaction-map', (req, res)=>{
	res.json(transactionPool.transactionMap);
});

//mine the transactions
app.get('/api/mine-transactions', (req, res)=>{
	transactionMiner.mineTransactions();
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
		syncRootInformation();
	}
});