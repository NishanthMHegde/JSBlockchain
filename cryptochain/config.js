const MINE_RATE = 1000;
const STARTING_BALANCE = 1000;

const MINING_REWARD = 50;
const MINING_INPUT = {address: "***REWARD***"}

const GENESIS_BLOCK = {
timestamp:'1',
lastHash: '0',
hash: '0',
data: [],
difficulty: 3,
nonce: 0
};

module.exports = { GENESIS_BLOCK, MINE_RATE, STARTING_BALANCE, MINING_REWARD, MINING_INPUT };