const Wallet = require('./index');
const {verifySignature} = require('../util');

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
});