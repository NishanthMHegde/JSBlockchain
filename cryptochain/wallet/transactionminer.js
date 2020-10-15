const Transaction = require('./transaction');

class TransactionMiner{
	constructor({blockchain, transactionPool, wallet, pubSub}){
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.pubSub = pubSub;
	}

	mineTransactions(){
		//grab all valid transactions
		let validTransactions = this.transactionPool.selectValidTransactions();
		//create a transaction reward for the miner
		let reward_transaction = Transaction.rewardTransaction({minerWallet:this.wallet});
		validTransactions.push(reward_transaction);

		//create a block with all the transactions
		this.blockchain.add_block({data:validTransactions});

		//broadcast the blockchain
		this.pubSub.publish('BLOCKCHAIN', JSON.stringify(this.blockchain.chain));

		//clear the transaction
		this.transactionPool.clearBlockchainTransactions(this.blockchain.chain);
		}
}

module.exports = TransactionMiner;