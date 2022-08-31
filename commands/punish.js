const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { punishment } = require(__dirname + '/../modules/punishment.js');
const { Violation } = require(__dirname + '/../db/dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('punish')
		.setDescription('Trừng phạt ai đó')
		.addUserOption(option =>
			option
			.setName('target')
			.setDescription('Người vi phạm')
            .setRequired(true),
        ).addIntegerOption(option =>
			option
			.setName('points')
			.setDescription('Điểm phạt')
            .setRequired(true),
        ).addStringOption(option =>
            option
            .setName('reason')
            .setDescription('Lí do phạt'),
        ).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const target = interaction.options.getUser('target');
        const victim = interaction.guild.members.cache.find(user => user.id === target.id);
        const points = interaction.options.getInteger('points');
		let reason = interaction.options.getString('reason');
        if (!reason) reason = '';
        if (victim.id == interaction.user.id) return interaction.reply('Bạn không thể tự trừng phạt bản thân! Sở thích dị vl');
        if (points <= 0) return interaction.reply({ content: 'Điểm phạt phải lớn hơn 0', ephemeral: true });
        Violation.findByPk(victim.id).then(async data => {
            if (data) {
                data.violation_points += points;
                await data.save();
                await punishment(interaction, victim, reason, data);
            }
            else {
                Violation.create({
                    user_id: victim.id,
                    violation_points: points,
                }).then((created) => {
                    punishment(interaction, victim, reason, created);
                }, (er) => {
                    console.error(er);
                });
            }
        }, err => console.error(err));
	},
};