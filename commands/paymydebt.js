const { SlashCommandBuilder } = require('discord.js');
const { Loan } = require(__dirname + '/../db/dbObjects.js');
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('paymydebt')
		.setDescription('Trả nợ')
        .addIntegerOption(option =>
            option
            .setName('amount')
            .setDescription('Số tiền muốn trả')
            .setRequired(true),
            ),
	async execute(interaction) {
        const target = interaction.user;
        let amount = Math.floor(interaction.options.getInteger('amount'));
        const loan = await Loan.findByPk(target.id);
        const balance = orca.balance(target.id);
        if (!loan) return interaction.reply({ content: 'Bạn không sở hữu khoản vay nào!', ephemeral: true });
        if (amount <= 0) return interaction.reply({ content: 'Số tiền trả nợ phải lớn hơn 0', ephemeral: true });
        if (balance < amount) return interaction.reply({ content: 'Số dư của bạn không đủ để trả chừng này tiền đâu =)', ephemeral: true });
        const passedDays = Math.floor(((new Date()).getTime() - (new Date(loan.createdAt)).getTime()) / (1000 * 3600 * 24));
        const total = Math.ceil(loan.amount * (1 + 0.1) ** (passedDays));
        if (amount > total) amount = total - loan.paid;
        orca.add(target.id, -amount);
        loan.paid += amount;
        if (loan.paid >= total) {
            await loan.destroy();
            return interaction.reply(`Chúc mừng ${target} đã bỏ ra ${amount.toLocaleString('vi-VI')} <:orcacoin:1012692278109798540> trả nợ thành công! Hãy học tập tấm gương này`);
        }
        else {
            await loan.save();
            return interaction.reply(`Sau khi trả ${amount.toLocaleString('vi-VI')} <:orcacoin:1012692278109798540>, khoản vay của ${target} còn ${(total - loan.paid).toLocaleString('vi-VI')} <:orcacoin:1012692278109798540> nữa!`);
        }
    },
};