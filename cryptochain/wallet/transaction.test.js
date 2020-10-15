const Transaction = require('./transaction');
const Wallet = require('./index');
const {verifySignature} = require('../util');
const {MINING_REWARD, MINING_INPUT} = require('../config');

describe("Transaction", ()=>{

	let transaction, senderWallet;
	beforeAll(()=>{
		senderWallet = new Wallet();
		amount = 50;
		recipient = 'recipient';
		transaction = new Transaction({senderWallet:senderWallet, recipient:recipient, amount:amount});
		
	});

	it("has a unique id", ()=>{
		expect(transaction).toHaveProperty('id');
	});

	describe("outputMap", ()=>{
		it("outputMap is defined", ()=>{
		expect(transaction).toHaveProperty('outputMap');
	});
	});

	describe("input", ()=>{
		it("input is defined", ()=>{
		expect(transaction).toHaveProperty('input');
	});

		it("input amount is equal to balance", ()=>{
			expect(transaction.input.amount).toEqual(senderWallet.balance);
		});

		it("signature verification for input is successful", ()=>{
			expect(verifySignature({
				publicKey: senderWallet.publicKey,
				data: transaction.outputMap,
				signature: transaction.input.signature
			})).toBe(true);
		});
	});

	describe("validate_transaction()", ()=>{

		let errorMock;

		beforeAll(()=>{
			errorMock = jest.fn();
			global.console.error = errorMock;
		});
		describe("transaction is valid", ()=>{
			it("valid transaction", ()=>{
				expect(Transaction.validate_transaction(transaction)).toBe(true);
			});
			
		});

		describe("transaction is invalid", ()=>{
			describe("invalid transaction due to wrong amount", ()=>{
				beforeAll(()=>{
					transaction.input.amount = 1100;
				});
				it("wrong amount", ()=>{
					expect(Transaction.validate_transaction(transaction)).toBe(false);
				});

				it("errorMock is called", ()=>{
					expect(errorMock).toHaveBeenCalled();
				});
				
			});

			describe("invalid transaction due to wrong signature", ()=>{
				beforeAll(()=>{
					transaction.input.signature = new Wallet().sign(transaction.outputMap);
				});
				it("wrong signature", ()=>{
					expect(Transaction.validate_transaction(transaction)).toBe(false);
				});
				it("errorMock is called", ()=>{
					expect(errorMock).toHaveBeenCalled();
				});
				
			});
			
		});
	});

	describe("update()", ()=>{
		new_recipient = "recipient2";
		new_amount = 75;
		let originalSignature;
		beforeAll(()=>{
			originalSignature = transaction.input.signature;
			transaction.update({senderWallet:senderWallet, recipient:new_recipient, amount:new_amount});
		});

		describe("successful update", ()=>{
			it("output value is fine", ()=>{
				expect(transaction.outputMap[new_recipient]).toEqual(new_amount);
			});

			it("input amount matches sum of output values", ()=>{
				const totalOutput = Object.values(transaction.outputMap).reduce((total,outputAmount) => total + outputAmount);
				expect(transaction.input.amount).toEqual(totalOutput);
			});

			it("new signature is obtained", ()=>{
				expect(originalSignature!==transaction.input.signature).toBe(true);
			});
			it("new signature is valid and verified", ()=>{
				expect(verifySignature({
					publicKey: senderWallet.publicKey,
					data:transaction.outputMap,
					signature: transaction.input.signature
				})).toBe(true);
			});

		});

		describe("unsuccessful update", ()=>{
			it("amount exceeds balance error", ()=>{
				expect(()=>{
					transaction.update({senderWallet:senderWallet, recipient:new_recipient, amount:876});
				}).toThrow("amount exceeds balance");
			});

		});
	});

	describe("rewardTransaction()", ()=>{
		let minerWallet;
		beforeAll(()=>{
			minerWallet = new Wallet();
			reward_transaction = Transaction.rewardTransaction({minerWallet: minerWallet});
		});

		it("has the mining reward", ()=>{
			expect(reward_transaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
		});
		it("has the mining input", ()=>{
			expect(reward_transaction.input).toEqual(MINING_INPUT);
		});
	});
	
});