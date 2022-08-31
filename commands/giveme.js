const { SlashCommandBuilder } = require('discord.js');
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveme')
		.setDescription('Tự tặng đồ cho bản thân')
        .setDefaultMemberPermissions(8)
        .addIntegerOption(option =>
            option
            .setName('amount')
            .setDescription('Nhập số tiền muốn nhận')
            .setRequired(true)),
        execute(interaction) {
        const myself = interaction.user;
        const amount = interaction.options.getInteger('amount');
        orca.add(myself.id, amount);
        return interaction.reply(`${myself} đã thành công tự tặng cho bản thân **${amount.toLocaleString('vi-VI')}** <:orcacoin:1012692278109798540>!! ʕ •ᴥ• ʔ`);
	},
};