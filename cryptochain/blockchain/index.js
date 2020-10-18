const {GENESIS_BLOCK} = require('../config');
const cryptoHash = require('../util/crypto-hash');
const Block = require('./block');
const hexToBinary = require('hex-to-binary');
const {MINING_REWARD, MINING_INPUT} = require('../config');
const Transaction = require('../wallet/transaction');

class Blockchain{
	constructor(){
		this.chain = [Block.genesis()];
	}

	add_block({data}){
		const new_block = Block.mine_block({last_block:this.chain[this.chain.length -1], data:data});
		this.chain.push(new_block);
		return new_block;
	}

	static valid_chain(chain){
		if (!(JSON.stringify(chain[0]) === JSON.stringify(Block.genesis()))){
			return false;
		}

		for(let i=1; i<chain.length; i++){
			const block = chain[i];
			const last_block = chain[i-1];
			//check if last hash is equal
			if (!(block.lastHash === last_block.hash)){
				return false;
			}

			//check if block difficulty differes by 1 unit
			if((Math.abs(block.difficulty - last_block.difficulty) > 1)){
				return false;
			}
			//check the proof of work requirement
			if(!(hexToBinary(block.hash).substring(0, block.difficulty) === '0'.repeat(block.difficulty))){
				return false;
			}
			//compute the hash of the block and re-verify it
			const new_hash = cryptoHash(block.timestamp, block.data, block.lastHash, block.nonce, block.difficulty);
			if (!(new_hash===block.hash)){
				return false;
			}


		}
		return true;

	}

	replace_chain(chain, validateTransactions=true, onSuccess){
		if (!(chain.length > this.chain.length)){
			console.error("The chain length is lesser than current chain length");
			return;
		}
		if (!(Blockchain.valid_chain(chain))){
			console.error("The chain is invalid");
			return;
		}
		//check if all the transactions in the chain are valid.
		if (validateTransactions){
		if (!Blockchain.validTransactionData(chain)){
			console.error("The transactions in the chain are invalid");
			return ;
		}
	}
		if (onSuccess){
			onSuccess();
		}
		this.chain = chain;
		console.log("Chain replacement successful!")
		return;
		
	}

	static validTransactionData(chain){

		//a transaction is said to be valid in a block if there is only one reward transaction.
		// if the transaction reward is correct.
		//if the transaction reward input is correct.
		//if the transaction is valid.
		//if a transaction appears only once in a blockchain.
		let rewardTransactionCount =0;
		let transactionSet = new Set();
		for (let i=1; i<chain.length; i++){
			let block = chain[i];
			rewardTransactionCount =0;
			let transactionSet = new Set();
			for(let transaction of block.data){
				if (transaction.input.address === MINING_INPUT.address){
					rewardTransactionCount = rewardTransactionCount + 1;
					if(rewardTransactionCount > 1){
						console.error("More than 1 reward transaction was found");
						return;
					}
					if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
						console.error("The mining reward was not valid");
						return;
					}
				}
				else {
					if(!Transaction.validate_transaction(transaction)){
						console.error("The transaction was not valid");
						return;
					}

					if (transactionSet.has(transaction)){
						console.error("The transaction was found to be a duplicate");
						return;
					}

				}
				transactionSet.add(transaction);

			}
		}
		return true;
	}
}

module.exports = Blockchain;

// blockchain = new Blockchain();
// new_blockchain = new Blockchain();
// new_blockchain.add_block({data:["1", "2"]});
// new_blockchain.add_block({data:["3", "4"]});
// // new_blockchain.add_block({data:["5", "6"]});
// // console.log(blockchain.chain);
// console.log(new_blockchain.chain);
// console.log(Blockchain.valid_chain(new_blockchain.chain));
// blockchain.replace_chain(new_blockchain.chain);
// console.log(blockchain.chain);
