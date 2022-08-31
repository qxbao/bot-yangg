const { SlashCommandBuilder } = require('discord.js');
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer')
		.setDescription('Chuyển tiền')
        .addUserOption(option =>
            option
            .setName('receiver')
            .setDescription('Người nhận')
            .setRequired(true))
        .addIntegerOption(option =>
            option
            .setName('amount')
            .setDescription('Nhập số tiền cần chuyển')
            .setRequired(true))
        .addStringOption(option =>
            option
            .setName('message')
            .setDescription('Nhập lời nhắn')),
        async execute(interaction) {
        const sender = interaction.user;
        const receiver = interaction.options.getUser('receiver');
        const amount = interaction.options.getInteger('amount');
        let msg = interaction.options.getString('message');
        const balance = await orca.balance(sender.id);
        const fee = Math.floor(amount * 0.05);
        if (receiver.id == sender.id) return interaction.reply({ content: 'Không thể tự chuyển tiền cho bản thân.', ephemeral: true });
        if (balance < (amount + fee)) return interaction.reply({ content: `Bạn chỉ có ${balance.toLocaleString('vi-VI')}, không thể gửi ${amount.toLocaleString('vi-VI')} kèm ${fee} phí chuyển khoản.\nNhập /loan để vay tiền ngay`, ephemeral: true });
        if (amount <= 0 || amount % 1000 != 0) return interaction.reply({ content: 'Số tiền cần gửi phải lớn hơn 0 và chia hết cho 1.000', ephemeral: true });
        if (!msg) msg = 'không có lời nhắn';
        orca.add(sender.id, -(amount + fee));
        orca.add(receiver.id, amount);

        return interaction.reply(`${sender} đã gửi thành công **${amount.toLocaleString('vi-VI')}** ${process.env.COIN} tới ${receiver}\n- Lời nhắn: ${msg}\n- Phí chuyển khoản: **${fee.toLocaleString('vi-VI')}** ${process.env.COIN}`);
    },
};