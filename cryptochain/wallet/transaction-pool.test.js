const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
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

});