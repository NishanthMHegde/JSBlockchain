const { v4: uuidv4 } = require('uuid');
const {verifySignature} = require('../util');
const {MINING_REWARD, MINING_INPUT} = require('../config');

class Transaction{
	constructor({senderWallet, recipient, amount, input, outputMap}){
		this.id = uuidv4();
		this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
		this.input = input || this.createInput({senderWallet, outputMap:this.outputMap});
	}

	createOutputMap({senderWallet, recipient, amount}){
		let output = {};
		output[recipient] = amount;
		output[senderWallet.publicKey] = senderWallet.balance - amount;
		return output;
	}

	createInput({senderWallet, outputMap}){
		const input = {
			timestamp: Date.now(),
			address: senderWallet.publicKey,
			amount: senderWallet.balance,
			signature: senderWallet.sign(outputMap)
		};
		return input;
	}

	static validate_transaction(transaction){
		const {input:{address, amount, signature}, outputMap} = transaction;
		//check if total value of output is equal to input amount
		const outputTotal = Object.values(outputMap).reduce((total, outputAmount)=>total + outputAmount);
		if (outputTotal !==amount){
			console.error("The input amount does not match the output total");

			return false;
		}

		if (!verifySignature({publicKey:address, data:outputMap, signature:signature})){
			console.error("The signature of the transaction was invalid");
			return false;
		}
		return true;

	}

	update({senderWallet,recipient, amount}){
		if (amount > this.outputMap[senderWallet.publicKey]){
			throw new Error("amount exceeds balance");
		}

		if(!(this.outputMap[recipient])){
			this.outputMap[recipient] = amount;
		}
		else {
			this.outputMap[recipient] = this.outputMap[recipient] + amount;
		}
		this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
		this.input = this.createInput({senderWallet, outputMap:this.outputMap});
	}

	static rewardTransaction({minerWallet}){
		return new this({
			input: MINING_INPUT,
			outputMap: {[minerWallet.publicKey] : MINING_REWARD}
		});
	}

}

module.exports = Transaction;