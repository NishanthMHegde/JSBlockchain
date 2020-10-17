const {ec} = require('../util');
const cryptoHash = require('../util/crypto-hash');
const {STARTING_BALANCE} = require('../config');
const Transaction = require('./transaction');

class Wallet{
	constructor(){
		this.balance = STARTING_BALANCE;
		this.keyPair = ec.genKeyPair();
		//get a hexadecimal encoded public key
		this.publicKey = this.keyPair.getPublic().encode('hex');
		//We should not use getPrivate and expose our private key anywhere
		//Sign the data using keyPair and private key will be used automatically.
	}

	sign(data){
		//We should not use getPrivate and expose our private key anywhere
		//Sign the data using keyPair and private key will be used automatically.
		//SHA256 hash the data before signing
		return this.keyPair.sign(cryptoHash(data));
	}

	createTransaction({recipient, amount, chain}){
		if (chain){
			//if a chain is passed, calculate the balance of the wallet from the passed in chain.
			this.balance = Wallet.calculateBalance({address: this.publicKey, chain: chain});
		}
		if (amount > this.balance){
			throw new Error("amount exceeds balance");
		}
		else {
			return new Transaction({senderWallet:this, recipient:recipient, amount:amount});
		}
	}

	static calculateBalance({address, chain}){
		let totalOutputAmount = 0;
		let hasConductedTransaction = false;
		//traverse through the blockchain in the reverse order to have the latest transactions come first
		for(let i=chain.length -1; i>0; i--){
			let block = chain[i];
			for(let transaction of block.data){
				if((transaction.input.address) === address){
					hasConductedTransaction = true;
				}
				const outputAmount = transaction.outputMap[address];
				if (outputAmount){
					totalOutputAmount = totalOutputAmount + outputAmount;
				}
			}
			if (hasConductedTransaction){
				break;
			}
			

		}
		if (!(hasConductedTransaction)){
			return STARTING_BALANCE + totalOutputAmount;
		}
		else{
		return totalOutputAmount;
	}
	// let balance = STARTING_BALANCE;
	// for (let i=1; i<chain.length; i++){
	// 	let block = chain[i];

	// 	for(let transaction of block.data){
	// 		const outputAmount = transaction.outputMap[address];
	// 		if(transaction.input.address == address){
	// 			balance = transaction.input.amount;
	// 			console.log(balance);
	// 		}
	// 		else if(outputAmount){
	// 			balance = balance + outputAmount;
	// 		}

	// 	}
	// }
	// return balance;
	}
}

module.exports = Wallet;