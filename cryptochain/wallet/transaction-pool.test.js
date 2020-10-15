const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const Wallet = require('./index');

describe("TransactionPool", ()=>{
	let transactionPool, transaction, wallet;

	beforeAll(()=>{
		wallet = new Wallet();
		transaction = new Transaction({senderWallet: wallet, recipient: 'recipient1', amount: 100});
		transactionPool = new TransactionPool();
	});

	it('setTransaction()', ()=>{
		transactionPool.setTransaction(transaction);
		expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
	});

	it('existingTransaction()', ()=>{
		expect(transactionPool.existingTransaction(wallet.publicKey)).toBe(transaction);
	});

	describe("transaction pool clear tests", ()=>{
		let validTransactions = [];
		let errorMock;
		beforeAll(()=>{
			errorMock = jest.fn();
			global.console.error = errorMock;
		transactionPool = new TransactionPool();
		wallet = new Wallet();
		for (let i=1; i<=10; i++){
			if(i%3 == 0){
			transaction = new Transaction({senderWallet: wallet, recipient:"recipient-fake", amount: 10});
			transaction.input.amount = 1001;
			transactionPool.setTransaction(transaction);
		}
		else if(i%2 == 0){
			transaction = new Transaction({senderWallet: wallet, recipient:"recipient-fake", amount: 10});
			transaction.input.signature = new Wallet().sign('foo');
			transactionPool.setTransaction(transaction);
		}
		else{
			transaction = wallet.createTransaction({recipient:"recipient-fake", amount: 10});
			transactionPool.setTransaction(transaction);
			validTransactions.push(transaction);
		}
		}
	});
		it("selectValidTransactions()", ()=>{
			expect(transactionPool.selectValidTransactions()).toEqual(validTransactions);
		});
		it("errorMock is called", ()=>{
			expect(errorMock).toHaveBeenCalled();
		});

		it("clearTransactionPool()", ()=>{
			transactionPool.clearTransactionPool();
			expect(transactionPool.transactionMap).toEqual({});
		});
	});

	describe("clearBlockchainTransactions()", ()=>{
		let non_blockchain_transactions = [];
		let blockchain;
		beforeAll(()=>{
			blockchain = new Blockchain();
		transactionPool = new TransactionPool();
		wallet = new Wallet();
		for (let i=1; i<=10; i++){
		if(i%2 == 0){
			transaction = new Transaction({senderWallet: wallet, recipient:"recipient-fake", amount: 10});
			transactionPool.setTransaction(transaction);
			non_blockchain_transactions.push(transaction);
		}
		else{
			transaction = wallet.createTransaction({recipient:"recipient-fake", amount: 10});
			transactionPool.setTransaction(transaction);
			blockchain.add_block({data: [transaction]});
		}
		}
	});
		it("clears all blockchain transactions", ()=>{
			transactionPool.clearBlockchainTransactions(blockchain.chain);
			expect(Object.values(transactionPool.transactionMap)).toEqual(non_blockchain_transactions);
		});
	});

});