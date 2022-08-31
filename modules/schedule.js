const cron = require('node-cron');
const { Loan, Wallet, Exp } = require(__dirname + '/../db/dbObjects.js');
const { orca } = require(__dirname + '/market.js');

// Hàm xử lý role
const giveRole = async (level, client, id) => {
	const guild = client.guilds.cache.find(m => m.id == process.env.GUILD_ID);
    const members = await guild.members.fetch();
    const member = members.get(id);
    if (!member.length) return;
    const role = [guild.roles.cache.find(r => r.name == 'Level 10'),
    guild.roles.cache.find(r => r.name == 'Level 20'),
    guild.roles.cache.find(r => r.name == 'Level 30'),
    guild.roles.cache.find(r => r.name == 'Level 40'),
    guild.roles.cache.find(r => r.name == 'Level 70'),
    guild.roles.cache.find(r => r.name == 'Level 100'),
    ];

    const removeAll = (mem) => {
        for (let i = 0; i < role.length; i++) {
            mem.roles.remove(role[i]);
        }
    };

    if (level < 10) {
        removeAll(member);
    }
    if (level >= 10 && level <= 20) {
        await removeAll(member);
        await member.roles.add(role[0]);
    }
    if (level >= 20 && level <= 30) {
        await removeAll(member);
        await member.roles.add(role[1]);
    }
    if (level >= 30 && level <= 40) {
        await removeAll(member);
        await member.roles.add(role[2]);
    }
    if (level >= 40 && level <= 70) {
        await removeAll(member);
        await member.roles.add(role[3]);
    }
    if (level >= 70 && level <= 100) {
        await removeAll(member);
        await member.roles.add(role[4]);
    }
};

const schedule = client => {
    // Kiểm tra nợ xấu (0h mỗi ngày)
    cron.schedule('0 0 * * *', async () => {
        // TÌm tất cả khoản nợ
        const loans = await Loan.findAll();
        const now = (new Date()).getTime();
        const badBorrower = [];
        // Lọc những khoản nợ xấu
        loans.forEach(loan => {
            const createdTime = (new Date(loan.createdAt)).getTime();
            if (now - createdTime > 1000 * 3600 * 24 * 3) {
                badBorrower.push(loan);
            }
        });
        // Nếu tồn tại nợ xấu
        if (badBorrower.length) {
            // Phạt, lên danh sách và thông báo lên channel chung
            await badBorrower.forEach(async borrower => {
                const exps = Math.ceil(borrower.amount / 25000000);
                borrower.exp = exps;
                const profile = await Exp.add(borrower.user_id, -exps);
                await giveRole(profile.exp, client, borrower.user_id);
            });
            client.channels.cache.get(process.env.MAINCHANNEL_ID).send(`**Danh sách nợ xấu**\n${badBorrower.map((i, index) => `**${index + 1}**. <@${i.user_id}> bị trừ ${i.exp} EXP!\n`).join('')}`);
        }

        // Nửa đêm mỗi ngày tặng tất cả người chơi 500m
        const allWallet = await Wallet.findAll();
        allWallet.forEach(async wallet => {
            const id = wallet.user_id;
            orca.add(id, 500000000);
        });
        client.channels.cache.get(process.env.MAINCHANNEL_ID).send('Toàn bộ người chơi được tặng 500.000.000 ORCA! Hãy sử dụng hợp lý');
    });
    // Mỗi một phút sẽ tặng tất cả người chơi 1m, không thích thì chỉnh hoặc xóa đi;
    cron.schedule('* * * * *', async () => {
        const allWallet = await Wallet.findAll();
        await allWallet.forEach(wallet => {
            const id = wallet.user_id;
            orca.add(id, 1000000);
        });
    });
};

module.exports = { schedule };