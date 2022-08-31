const { SlashCommandBuilder } = require('discord.js');
const { Exp } = require(__dirname + '/../db/dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Kiểm tra level')
        .addUserOption(option => option.setName('target').setDescription('Đối tượng muốn kiểm tra')),
	async execute(interaction) {
		let target = interaction.options.getUser('target');
        if (!target) target = interaction.user;
        const profile = await Exp.findByPk(target.id);

        if (!profile) return interaction.reply(`${target} có level là 0.`);
        const level = Math.floor(profile.exp / 50);
        return interaction.reply(`${target} đang có level ${level}. Bạn cần ${(level + 1) * 50 - profile.exp} EXP nữa để lên level tiếp theo`);

	},
};