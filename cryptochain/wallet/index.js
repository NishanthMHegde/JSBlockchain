const {ec} = require('../util');
const cryptoHash = require('../util/crypto-hash');
const {STARTING_BALANCE} = require('../config');

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
}

module.exports = Wallet;