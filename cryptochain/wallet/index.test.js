const Wallet = require('./index');
const {verifySignature} = require('../util');
const Transaction = require('./transaction');

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
});