const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('confess')
		.setDescription('Mượn rịu tỏ tình')
		.addUserOption(option => option.setName('target').setDescription('đối tượng cụa bạn').setRequired(true)),
	execute(interaction) {
        const user = interaction.options.getUser('target');
		interaction.reply(`Hey <@${user.id}>, <@${interaction.user.id}> wanna tell u that he/she loves u so fkin much ʕ ି ڡ ି ʔ`);
	},
};