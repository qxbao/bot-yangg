const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const coin = '<:orcacoin:1012692278109798540>';
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Tương tác với nhạc :notes:')
        .addSubcommand(subcmd =>
            subcmd
            .setName('add')
            .setDescription('Thêm nhạc vào danh sách chờ')
            .addStringOption(opt =>
                opt
                .setName('track')
                .setDescription('Tên bài nhạc muốn chơi')
                .setRequired(true),
                ),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('stop')
            .setDescription('Dừng chơi nhạc'),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('skip')
            .setDescription('Chuyển sang bài tiếp'),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('playlist')
            .setDescription('Xem danh sách phát')),
	async execute(interaction, client, player) {
        const subcmd = interaction.options.getSubcommand();
        const myVoiceChannel = interaction.member.voice.channel;
        if (!myVoiceChannel) return interaction.reply(`Bạn cần ở trong kênh <#${process.env.MUSIC_ID}> để thực hiện lệnh này!`);
        if (myVoiceChannel.id != 1013260418086600704) return interaction.reply(`Bạn cần ở trong kênh ${process.env.MUSIC_ID} để thực hiện lệnh này!`);

        if (subcmd == 'add') {
            const trackQuery = interaction.options.getString('track');
            const balance = await orca.balance(interaction.user.id);
            if (balance < 10000000) return await interaction.reply({ content: `Một bài hát có giá 10.000.000 ${coin}. Chắc chắn rằng bạn có nhiều tiền hơn thế`, ephemeral: true });
            const queue = player.createQueue(interaction.guild, {
                metadata: {
                    channel: interaction.channel,
                },
            });
            try {
                if (!queue.connection) await queue.connect(myVoiceChannel);
            }
            catch {
                queue.destroy();
                return await interaction.reply({ content: 'Không thể gia nhập kênh âm thanh của bạn :(', ephemeral: true });
            }

            // Tìm kiếm track
            const track = await player.search(trackQuery, {
                requestedBy: interaction.user,
            }).then(x => x.tracks[0]);

            if (!track) return await interaction.followUp({ content: `Không thể tìm thấy bài hát với từ khóa: **${trackQuery}**` });
            // Chơi nhạc
            queue.play(track);
            orca.add(interaction.user.id, -10000000);
            const embed = new EmbedBuilder()
                .setTitle(track.title)
                .setURL(track.url)
                .setDescription(`Đã thu **10.000.000** ${coin}. Track đã được thêm vào playlist.`)
                .addFields(
                { name: 'Người yêu cầu', value: `${interaction.user}`, inline:true },
                { name: 'Độ dài', value: track.duration, inline:true },
                );
            return await interaction.reply({ embeds: [embed] });
        }
        if (subcmd == 'stop') {
            const queue = player.getQueue(interaction.guild.id);
            if (queue) {
                await interaction.reply({ content: `${interaction.user} đã dừng phát nhạc!`, ephemeral: false });
                return queue.stop();
            }
            return await interaction.reply({ content: 'Không tồn tại danh sách phát để dừng phát.', ephemeral: true });
        }

        if (subcmd == 'skip') {
            const queue = player.getQueue(interaction.guild.id);
            if (queue) {
                if (!queue.toJSON().tracks.length) return await interaction.reply({ content: 'Không tồn tại danh sách phát để chuyển tiếp.', ephemeral: true });
                await interaction.reply({ content: `${interaction.user} đã chuyển tiếp bài hát!`, ephemeral: false });
                return queue.skip();
            }
            return await interaction.reply({ content: 'Không tồn tại danh sách phát để chuyển tiếp.', ephemeral: true });
        }

        if (subcmd == 'playlist') {
            const queue = player.getQueue(interaction.guild.id);
            const playlistShow = (json) => {
                const foo = json.map((i, index) => `**${index + 1}**. ${i.title} - <@${i.requestedBy}> :notes:`).join('\n');
                return foo;
            };
            if (queue) {
                if (!queue.toJSON().tracks.length) return await interaction.reply({ content: 'Không tồn tại danh sách phát', ephemeral: true });
                return await interaction.reply({ content: `**DANH SÁCH PHÁT**\n${playlistShow(queue.toJSON().tracks)}`, ephemeral: true });
            }
            return await interaction.reply({ content: 'Không tồn tại danh sách phát', ephemeral: true });
        }
    },
};