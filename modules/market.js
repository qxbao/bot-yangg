// File xử lý các lệnh về tiền
const { Collection } = require('discord.js');
const orca = new Collection();
const { Wallet } = require(__dirname + '/../db/dbObjects.js');

// Lệnh thêm tiền
Reflect.defineProperty(orca, 'add', {
    value: async (id, amount) => {
        const wallet = orca.get(id);

        if (wallet) {
            wallet.orca += Number(amount);
            return Wallet.upsert(wallet.dataValues);
        }

        const newWallet = await Wallet.create({ user_id: id, orca: amount });
        orca.set(id, newWallet);

        return newWallet;
    },
});

// Lệnh kiểm tra số dư
Reflect.defineProperty(orca, 'balance', {
    value: async id => {
        const wallet = await Wallet.findOne({ where: { user_id: id } });

        if (wallet) return wallet.orca;
        return 0;
    },
});

module.exports = { orca };