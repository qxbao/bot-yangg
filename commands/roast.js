const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roast')
		.setDescription('Bot chửi thuê')
		.addUserOption(option =>
			option
			.setName('user')
			.setDescription('Mục tiêu ăn chửi')),
	async execute(interaction) {
		let victim = interaction.options.getUser('user') ?? interaction.user;
		if (victim.id == process.env.ADMIN_ID) victim = interaction.user;
		return await interaction.reply(`Địt con mẹ mày ${victim}`);
	},
};