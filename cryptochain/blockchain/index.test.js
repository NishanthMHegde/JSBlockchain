const {GENESIS_BLOCK} = require('../config');
const cryptoHash = require('../util/crypto-hash');
const Block = require('./block');
const Blockchain = require('./index');

describe("Blockchain()", ()=>{
	let blockchain, new_blockchain;
	beforeEach(()=>{
		blockchain = new Blockchain();
		new_blockchain = new Blockchain();
		new_blockchain.add_block({data:["1", "2"]});
		new_blockchain.add_block({data:["3", "4"]});
		new_blockchain.add_block({data:["5", "6"]});
		original_chain = blockchain.chain;
	});
	it("has a genesis block as first block", ()=>{
		expect(blockchain.chain[0]).toEqual(Block.genesis());
	});

	it("chain is an instance of array", ()=>{
		expect(blockchain.chain instanceof Array).toBe(true);
	});

	it("add block works as expected", ()=>{
		const new_block = blockchain.add_block({data:["1", "2"]});
		expect(blockchain.chain[1]).toEqual(new_block);
	});

	describe("valid_chain()", ()=>{
		describe("wrong genesis", ()=>{
			it("chain invalid due to wrong genesis", ()=>{
				blockchain.chain[0].hash = 'wrong_hash';
				expect(Blockchain.valid_chain(blockchain.chain)).toBe(false);
			});
			
		});

		describe("wrong lastHash", ()=>{
			it("chain invalid due to wrong lastHash", ()=>{
				const new_block = blockchain.add_block({data:["1", "2"]});
				blockchain.chain[1].lastHash = 'wrong_lasthash';
				expect(Blockchain.valid_chain(blockchain.chain)).toBe(false);
			});
			
		});
		describe("wrong hash", ()=>{
			it("chain invalid due to wrong hash", ()=>{
				const new_block = blockchain.add_block({data:["1", "2"]});
				blockchain.chain[1].hash = '00101010';
				expect(Blockchain.valid_chain(blockchain.chain)).toBe(false);
			});
			
		});
		describe("wrong proof of work", ()=>{
			it("chain invalid due to wrong proof of work", ()=>{
				const new_block = blockchain.add_block({data:["1", "2"]});
				blockchain.chain[1].hash = 'xyzpqr';
				expect(Blockchain.valid_chain(blockchain.chain)).toBe(false);
			});
			
		});
		describe("wrong difficulty", ()=>{
			it("chain invalid due to wrong difficulty", ()=>{
				const new_block = blockchain.add_block({data:["1", "2"]});
				blockchain.chain[1].difficulty = 10;
				expect(Blockchain.valid_chain(blockchain.chain)).toBe(false);
			});
			
		});

		describe("proper validation of chain", ()=>{
			it("chain is valid", ()=>{
				const new_block = blockchain.add_block({data:["1", "2"]});
				expect(Blockchain.valid_chain(blockchain.chain)).toBe(true);
			});
			
		});

	});

	describe("replace_chain()", ()=>{
		let errorMock,logMock;
		beforeEach(()=>{
			errorMock = jest.fn();
			logMock = jest.fn();
			global.console.error = errorMock;
			global.console.log = logMock;
		});
			describe("chain replacement fails due to bad genesis block", ()=>{
				beforeEach(()=>{
					new_blockchain.chain[0].data = ['abc'];
					blockchain.replace_chain(new_blockchain.chain);
				});
				it("bad genesis", ()=>{
					console.log(blockchain.chain);
					console.log(original_chain)
					expect(blockchain.chain).toEqual(original_chain);
				});

				it("error called", ()=>{
					expect(errorMock).toHaveBeenCalled();
				});
			});

			describe("chain replacement fails due to bad last hash", ()=>{

				beforeEach(()=>{
					new_blockchain.chain[2].lastHash = 'abc';
					blockchain.replace_chain(new_blockchain.chain);
				});
				it("bad lastHash", ()=>{
					expect(blockchain.chain).toEqual(original_chain);
				});


				it("error called", ()=>{
					expect(errorMock).toHaveBeenCalled();
				});
			});

			describe("chain replacement fails due to wrong hash", ()=>{
				beforeEach(()=>{
					new_blockchain.chain[3].hash = 'abc';
					blockchain.replace_chain(new_blockchain.chain);
				});
				it("wrong hash", ()=>{
					expect(blockchain.chain).toEqual(original_chain);
				});

				it("error called", ()=>{
					expect(errorMock).toHaveBeenCalled();
				});
			});

			describe("chain replacement fails due to small length", ()=>{
				beforeEach(()=>{
					blockchain = new Blockchain();
					new_blockchain = new Blockchain();
					blockchain.replace_chain(new_blockchain.chain);
				});
				it("small length", ()=>{
					expect(blockchain.chain).toEqual(original_chain);
				});

				it("error called", ()=>{
					expect(errorMock).toHaveBeenCalled();
				});
			});

		describe("chain replacement is successful",()=> {
			beforeEach(()=>{
				blockchain.replace_chain(new_blockchain.chain);
				
			});
			
			it("successful replacement", ()=>{
					expect(blockchain.chain).toEqual(new_blockchain.chain);
				});
			it("log called", ()=>{
					expect(logMock).toHaveBeenCalled();
				});
		});
	});
});