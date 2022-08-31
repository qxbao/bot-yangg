const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Violation } = require(__dirname + '/../db/dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forgive')
		.setDescription('Giảm điểm vi phạm cho ai đó')
		.addUserOption(option =>
			option
			.setName('target')
			.setDescription('Đối tượng ân xá')
			.setRequired(true),
		).addIntegerOption(option =>
			option
			.setName('points')
			.setDescription('Số điểm muốn hạ')
			.setRequired(true),
		).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
	async execute(interaction) {
		const target = interaction.options.getUser('target');
		let points = interaction.options.getInteger('points');
        if (points <= 0) return interaction.reply({ content: 'Số điểm ân xá phải lớn hơn 0', ephemeral: true });
        Violation.findByPk(target.id).then(async data => {
			if (data && data.violation_points != 0) {
				if (data.violation_points < points) points = data.violation_points;
				data.violation_points -= points;
				await data.save();
				return interaction.reply(`${ target }, bạn vừa được hạ ${points} điểm vi phạm.\n Số điểm vi phạm hiện tại của bạn là: **${data.violation_points}**. Hãy làm một công dân tốt!`);
			}
			else {
				return interaction.reply(`Điểm vi phạm của ${ target } là **0**. Ân xá là không cần thiết`);
			}
		}, err => console.error(err));
	},
};