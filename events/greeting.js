const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Gửi thiệp chào khi có người mới tham gia vào Guild

module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async execute(member) {
		const greetingEmbed = new EmbedBuilder()
			.setTitle('Có ngừi mới zô nè!!')
			.setDescription(`Là ${member.user.tag} chứ không ai khác (ﾉ≧ڡ≦)! Chào mừng chào mừng ~\nBạn là thành viên thứ ${member.guild.memberCount} đó\nNhớ vào <#1012107573270413362> tìm hiểu và không vi phạm luật nhé!`)
			.setColor('00A170');
        const channel = member.guild.channels.cache.find(ch => ch.name === 'chung');
		if (!channel) return;
		await channel.send({ embeds: [greetingEmbed] });
	},
};