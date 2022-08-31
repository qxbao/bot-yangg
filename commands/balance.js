const { SlashCommandBuilder } = require('discord.js');
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Kiểm tra số dư')
        .addUserOption(option => option.setName('target').setDescription('Đối tượng muốn kiểm tra')),
	async execute(interaction) {
		let status = false;
        let target = interaction.options.getUser('target');
		if (!target) {
			target = interaction.user;
			status = true;
		}

        return interaction.reply({ content: `${target} hiện có **${(await orca.balance(target.id)).toLocaleString('vi-VI')}** <:orcacoin:1012692278109798540>!!! Cả một gia tài khổng lồ`, ephemeral: status });
	},
};