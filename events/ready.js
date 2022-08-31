const { Wallet } = require(__dirname + '/../db/dbObjects.js');
const { orca } = require(__dirname + '/../modules/market.js');

// Event khi server bắt đầu
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
        const storedBalances = await Wallet.findAll();
        storedBalances.forEach(b => orca.set(b.user_id, b));
        console.log(`BOT ${client.user.tag} đã sẵn sàng /(>o<)/ Fighting!!!`);
	},
};