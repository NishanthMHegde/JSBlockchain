const {GENESIS_BLOCK} = require('./config');
const cryptoHash = require('./crypto-hash');
const Block = require('./block');

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
				// console.log(`last hashes ${block.lastHash} and ${last_block.hash} do not match`)
				return false;
			}

			//compute the hash of the block and re-verify it
			const new_hash = cryptoHash(block.timestamp, block.data, block.lastHash);
			if (!(new_hash===block.hash)){
				return false;
			}
		}
		return true;

	}

	replace_chain(chain){
		if (!(chain.length > this.chain.length)){
			console.error("The chain length is lesser than current chain length");
			return;
		}
		if (!(Blockchain.valid_chain(chain))){
			console.error("The chain is invalid");
			return;
		}
		this.chain = chain;
		console.log("Chain replacement successful!")
		return;
		
	}
}

module.exports = Blockchain;

// blockchain = new Blockchain();
// new_blockchain = new Blockchain();
// new_blockchain.add_block({data:["1", "2"]});
// new_blockchain.add_block({data:["3", "4"]});
// new_blockchain.add_block({data:["5", "6"]});
// console.log(blockchain.chain);
// console.log(new_blockchain.chain);

// blockchain.replace_chain(new_blockchain.chain);
// console.log(blockchain.chain);
