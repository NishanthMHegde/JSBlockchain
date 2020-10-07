const {GENESIS_BLOCK, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');
const hexToBinary = require('hex-to-binary');

class Block{
	constructor({timestamp,lastHash,hash,data, nonce, difficulty}){
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty;
	}
	static genesis(){
		return new this(GENESIS_BLOCK);
	}

	static mine_block({last_block, data}){
		let hash, nonce, difficulty, timestamp;
		const lastHash = last_block.hash;
		nonce = -1;
		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjust_difficulty({original_block:last_block, timestamp});
			hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
		}while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
		
		return new this({
			timestamp,
			lastHash,
			data,
			hash,
			nonce,
			difficulty
		});
	}

	static adjust_difficulty({original_block, timestamp}){
		if ((timestamp - original_block.timestamp) < MINE_RATE){
			return (original_block.difficulty + 1);
		}
		else if ((original_block.difficulty -1) > 0){
			return (original_block.difficulty -1);
		}

		return 1;
	}
}
module.exports = Block;

// const block1 = new Block({timestamp:'01', lastHash:'xyz', hash:'pqr', data:'abc'})
// console.log('BLock1', block1);
// const block2 = Block.genesis();
// console.log('BLock2', block2);
// const block3 = Block.mine_block({last_block:block2, data:"ABC"});
// console.log('BLock3', block3);
