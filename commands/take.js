const { SlashCommandBuilder } = require('discord.js');
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('take')
		.setDescription('Đi thu tiền')
        .setDefaultMemberPermissions(8)
        .addUserOption(option =>
            option
            .setName('victim')
            .setDescription('Đối tượng')
            .setRequired(true),
        ).addIntegerOption(option =>
            option
            .setName('amount')
            .setDescription('Nhập số tiền muốn nhận')
            .setRequired(true),
        ),
        async execute(interaction) {
        const victim = interaction.options.getUser('victim');
        let amount = interaction.options.getInteger('amount');
        const balance = await orca.balance(victim.id);
        if (amount <= 0) return interaction.reply({ content: 'Số tiền phải lớn hơn 0', ephemeral: true });
        if (victim.id == interaction.user.id) return interaction.reply({ content: 'Không thể tự thu tiền của bản thân', ephemeral: true });
        if (balance < amount) amount = balance;
        orca.add(victim.id, -amount);
        orca.add(interaction.user.id, amount);
        return interaction.reply(`${interaction.user} đã thu **${amount.toLocaleString('vi-VI')}** ${process.env.COIN} phí bảo kê từ ${victim}`);
	},
};