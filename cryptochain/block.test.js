const Block = require('./block');
const {GENESIS_BLOCK} = require('./config');
const cryptoHash = require('./crypto-hash');


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

		it('hash value is correct', ()=> {
			expect(mined_block.hash).toEqual(cryptoHash(mined_block.data, mined_block.lastHash, mined_block.timestamp));
		});

	});
});