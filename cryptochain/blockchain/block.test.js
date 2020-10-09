const Block = require('./block');
const {GENESIS_BLOCK, MINE_RATE} = require('../config');
const cryptoHash = require('../util/crypto-hash');
const hexToBinary = require('hex-to-binary')

describe('Block()', () =>{
	const timestamp = '12345';
	const lastHash = '01';
	const hash = '02';
	const data = ['1', '2'];
	const block = new Block({timestamp, lastHash, hash, data});
	it('checks for timestamp, lastHash, hash and data field', ()=>{
		expect(block.timestamp).toEqual(timestamp);
		expect(block.lastHash).toEqual(lastHash);
		expect(block.hash).toEqual(hash);
		expect(block.data).toEqual(data);
	});

	//Genesis block tests
	describe('genesis()', ()=>{
		const genesis_block = Block.genesis();

		it('genesis block is instance of Block', ()=>{
			expect(genesis_block instanceof Block).toBe(true);
		});

		it('genesis block has correct data', ()=>{
			expect(genesis_block).toEqual(GENESIS_BLOCK);
		});


	});

	//Mine block tests
	describe('mine_block()', ()=>{
		const genesis_block = Block.genesis();
		const data = ['x', 'y'];
		const mined_block = Block.mine_block({last_block:genesis_block, data:data});
		it('mined block is instance of Block', ()=>{
			expect(mined_block instanceof Block).toBe(true);
		});

		it('lastHash value check', ()=>{
			expect(mined_block.lastHash).toEqual(genesis_block.hash);
		});

		it('timestamp is not undefined', ()=>{
			expect(mined_block.timestamp).not.toEqual(undefined);
		});

		it('proper data values', ()=>{
			expect(mined_block.data).toEqual(data);
		});
		it('has a nonce', ()=>{
			expect(mined_block.nonce).not.toEqual(undefined);
		});
		it('has a difficulty', ()=>{
			expect(mined_block.difficulty).not.toEqual(undefined);
		});
		it('hash value is correct', ()=> {
			expect(mined_block.hash).toEqual(cryptoHash(mined_block.data, mined_block.lastHash, mined_block.timestamp, mined_block.nonce, mined_block.difficulty));
		});
		it('difficulty values differ by not more than 1', ()=>{
			expect((Math.abs(mined_block.difficulty - genesis_block.difficulty) > 1)).toEqual(false);
		});
		it('Proof of work is correct', ()=> {
			expect(hexToBinary(mined_block.hash).substring(0, mined_block.difficulty)).toEqual('0'.repeat(mined_block.difficulty));
		});

		describe('difficulty is reduced by 1', ()=> {
			it('difficulty value reduced by 1 is returned', ()=>{
				const block1 = Block.mine_block({last_block:Block.genesis(), data:['1', '2']});
				const block2 = Block.mine_block({last_block:block1, data:['2', '4']});
				block2.timestamp = block1.timestamp + MINE_RATE + 1;

			expect(Block.adjust_difficulty({original_block: block1, timestamp:block2.timestamp})).toEqual((block1.difficulty - 1));
		});
		});

		describe('difficulty is increased by 1', ()=> {
			it('difficulty value reduced by 1 is returned', ()=>{
				const block1 = Block.mine_block({last_block:Block.genesis(), data:['1', '2']});
				const block2 = Block.mine_block({last_block:block1, data:['2', '4']});

			expect(Block.adjust_difficulty({original_block: block1, timestamp:block2.timestamp})).toEqual((block1.difficulty + 1));
		});
		});
		

	});
});