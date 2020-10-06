const {GENESIS_BLOCK} = require('./config');
const cryptoHash = require('./crypto-hash');

class Block{
	constructor({timestamp,lastHash,hash,data}){
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
	}
	static genesis(){
		return new this(GENESIS_BLOCK);
	}

	static mine_block({last_block, data}){
		const timestamp = Date.now();
		const lastHash = last_block.hash;
		const hash = cryptoHash(timestamp, lastHash, data);
		return new this({
			timestamp,
			lastHash,
			data,
			hash
		});
	}
}
module.exports = Block;

// const block1 = new Block({timestamp:'01', lastHash:'xyz', hash:'pqr', data:'abc'})
// console.log('BLock1', block1);
// const block2 = Block.genesis();
// console.log('BLock2', block2);
// const block3 = Block.mine_block({last_block:block2, data:"ABC"});
// console.log('BLock3', block3);
