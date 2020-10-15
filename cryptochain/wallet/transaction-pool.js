const Transaction = require('./transaction');

class TransactionPool{
	constructor(){
		this.transactionMap = {};
	}

	setTransaction(transaction){
		this.transactionMap[transaction.id] = transaction;
	}

	setTransactionMap(transactionMap){
		this.transactionMap = transactionMap;
	}

	existingTransaction(inputAddress){
		const transactions = Object.values(this.transactionMap);
		return transactions.find(transaction => transaction.input.address === inputAddress);
	}

	selectValidTransactions(){
		const valid_transactions = Object.values(this.transactionMap).filter(transaction => Transaction.validate_transaction(transaction));
		return valid_transactions;
	}

	clearTransactionPool(){
		this.transactionMap = {};
	}

	clearBlockchainTransactions(chain){
		for (let i=1;i<chain.length; i++){
			let block = chain[i];
			for (let transaction of block.data){
				if (this.transactionMap[transaction.id]){
					delete this.transactionMap[transaction.id];
				}
			}
		}
	}

}

module.exports = TransactionPool;