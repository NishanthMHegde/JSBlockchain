const Wallet = require('./index');
const {verifySignature} = require('../util');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const {STARTING_BALANCE} = require('../config');

describe("Wallet()", ()=>{
	let wallet;
	beforeEach(()=>{
		wallet = new Wallet();
	});

	it("has a balance", ()=>{
		expect(wallet).toHaveProperty('balance');
	});	

	it("has a publicKey", ()=>{
		expect(wallet).toHaveProperty('publicKey');
	});

	it("verifies the correct signature", ()=>{
		data = "foo";
		expect(verifySignature({
			publicKey: wallet.publicKey,
			data: data,
			signature: wallet.sign(data)
		})).toBe(true);
	});

	it("does not verify the incorrect signature", ()=>{
		data = "foo";
		expect(verifySignature({
			publicKey: wallet.publicKey,
			data: data,
			signature: wallet.sign("ball")
		})).toBe(false);
	});

	describe("createTransaction()", ()=>{
		let new_transaction, new_wallet;
		beforeAll(()=>{
			new_wallet = new Wallet();
			new_transaction = new_wallet.createTransaction({recipient:"recipient1", amount:45});
		});

		describe("successful createTransaction", ()=>{
			it("is a transaction instance", ()=>{
				expect(new_transaction instanceof Transaction).toBe(true);
			});
			it("has input", ()=>{
				expect(new_transaction).toHaveProperty('input');
			});
			it("has outputMap", ()=>{
				expect(new_transaction).toHaveProperty('outputMap');
			});
			it("has proper input amount matching wallet balance", ()=>{
				expect(new_transaction.input.amount).toEqual(new_wallet.balance);
			});
			it("has proper signature", ()=>{
				expect(verifySignature({
				publicKey: new_wallet.publicKey,
				data: new_transaction.outputMap,
				signature: new_transaction.input.signature
			})).toBe(true);
			});
		});

		describe("createTransaction fails due to amount", ()=>{

			it("amount exceeds balance", ()=>{
				expect(()=>{
					new_wallet.createTransaction({recipient:"recipient2", amount:1001});
			}).toThrow("amount exceeds balance");
			});
			
		});
	});

	describe("calculateBalance()", ()=>{
		let wallet, blockchain;

		beforeEach(()=>{
			wallet = new Wallet();
			blockchain = new Blockchain();
		});

		describe("empty blockchain", ()=>{
			it("returns the STARTING_BALANCE", ()=>{
				expect(Wallet.calculateBalance({address: wallet.publicKey, chain: blockchain.chain})).
				toEqual(STARTING_BALANCE);
			});
		});

		describe("wallet has only received transactions", ()=>{
			beforeEach(()=>{
				transaction1 = new Wallet().createTransaction({recipient:wallet.publicKey, amount:45});
				transaction2 = new Wallet().createTransaction({recipient:wallet.publicKey, amount:55});
				blockchain.add_block({data:[transaction1, transaction2]});
			});

			it("has the correct amount in the balance", ()=>{
				expect(Wallet.calculateBalance({address: wallet.publicKey, chain:blockchain.chain})).
				toEqual(STARTING_BALANCE + transaction1.outputMap[wallet.publicKey] + transaction2.outputMap[wallet.publicKey]);
			});
		});

		describe("wallet has only conducted transactions", ()=>{
			beforeEach(()=>{
				transaction1 = wallet.createTransaction({recipient:"foo1", amount:45, chain: blockchain.chain});
				// transaction2 = wallet.createTransaction({recipient:"foo2", amount:55, chain: blockchain.chain});
				blockchain.add_block({data:[transaction1]});
			});

			it("has the correct amount in the balance", ()=>{
				expect(Wallet.calculateBalance({address: wallet.publicKey, chain:blockchain.chain})).
				toEqual(transaction1.outputMap[wallet.publicKey]);
			});
		});

		describe("wallet has transactions from multiple blocks", ()=>{
			beforeEach(()=>{
				transaction1 = wallet.createTransaction({recipient:"foo1", amount:45, chain: blockchain.chain});
				// transaction2 = wallet.createTransaction({recipient:"foo2", amount:55, chain: blockchain.chain});
				blockchain.add_block({data:[transaction1]});

				transaction2 = Transaction.rewardTransaction({minerWallet: wallet});
				transaction3 = new Wallet().createTransaction({recipient:wallet.publicKey, amount:27, chain: blockchain.chain});
				blockchain.add_block({data: [transaction2, transaction3]});
			});

			it("has the correct amount in the balance when multip blocks are found", ()=>{
				expect(Wallet.calculateBalance({address: wallet.publicKey, chain:blockchain.chain})).
				toEqual(transaction1.outputMap[wallet.publicKey] + transaction2.outputMap[wallet.publicKey] + transaction3.outputMap[wallet.publicKey]);
			});
		});
	});
});