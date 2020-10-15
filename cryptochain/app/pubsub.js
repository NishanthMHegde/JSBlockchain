const redis = require('redis');

const CHANNELS = {
	BLOCKCHAIN: 'BLOCKCHAIN',
	TRANSACTION: 'TRANSACTION',
	TEST: 'TEST'
};
class PubSub{
	constructor({blockchain, transactionPool}){
		this.publisher = redis.createClient();
		this.subscriber = redis.createClient();
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.subscribe();
		this.subscriber.on('message', (channel, message) =>{
			this.handle_message(channel, message);
		});
	}

	handle_message(channel, message){
		console.log(`Message ${message} received on channel ${channel}`);
		if (channel ==='BLOCKCHAIN'){
			const new_chain = JSON.parse(message);
			this.blockchain.replace_chain(new_chain, ()=>{
				this.transactionPool.clearBlockchainTransactions(new_chain);
			});
			console.log("Replaced the chain");
		}
		else if (channel ==='TRANSACTION'){
			const transaction = JSON.parse(message);
			this.transactionPool.setTransaction(transaction);
			console.log("Consumed the new transaction");
		}
	}

	subscribe(){
		Object.values(CHANNELS).forEach((channel)=>{
			this.subscriber.subscribe(channel);
		});
	}

	publish(channel, message){
		//subscriber needs to unsubscrible from the channel on which it is 
		//publishing a message and then re-subscibe again to the same channel.
		this.subscriber.unsubscribe(channel, ()=>{
			this.publisher.publish(channel, message, ()=>{
				this.subscriber.subscribe(channel);
			});
		});
	}
}

// pubsub = new PubSub();
// setTimeout(()=>{
// 	pubsub.publish('TEST', "Hello World!");
// }, 1000);

module.exports = PubSub;