const EC = require('elliptic').ec;
const cryptoHash = require('./crypto-hash');

const ec = new EC('secp256k1');
const verifySignature = ({publicKey, data, signature}) =>{
	const pkey = ec.keyFromPublic(publicKey, 'hex');
	return pkey.verify(cryptoHash(data), signature);
};

module.exports = {ec, verifySignature};