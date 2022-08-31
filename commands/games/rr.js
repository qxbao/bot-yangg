const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const rr = async (interaction, amount, orca) => {
    const me = interaction.user;
    const coin = '<:orcacoin:1012692278109798540>';
    const enemy = interaction.options.getUser('target');
    const randomNumber = (Math.floor(Math.random() * 999999)).toString();
    const players = [me, enemy];
    const embedData = { 'color': '#AEBCC4', 'title': `RUSSIAN ROULETTE #${randomNumber}`, 'desc': `${me} đã gửi một lời thách đấu trị giá **${amount.toLocaleString('vi-VI')}** ${coin} tới ${enemy}.\nLiệu bạn có dám đồng ý?` };
    const bullets = [0, 0, 0, 0, 0, 0];
    const bulletPosition = Math.floor(Math.random() * 6);
    bullets[bulletPosition] = 1;

    const getEmbed = () => {
        const emb = new EmbedBuilder()
            .setTitle(embedData.title)
            .setDescription(embedData.desc)
            .setColor(embedData.color);
        return emb;
    };
    const buttonSet = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId(`accept${randomNumber}`)
            .setLabel('Chấp nhận')
            .setStyle(ButtonStyle.Success),
    ).addComponents(
        new ButtonBuilder()
            .setCustomId(`decline${randomNumber}`)
            .setLabel('Từ chối')
            .setStyle(ButtonStyle.Danger),
    );

    const filter = (i) => (i.customId == `accept${randomNumber}` || i.customId == `decline${randomNumber}`) && i.user.id == enemy.id;
    const buttonConnection = interaction.channel.createMessageComponentCollector({ filter, time: 25000 });
    buttonConnection.on('collect', async i => {
        const customId = i.customId;
        if (customId == `decline${randomNumber}`) {
            embedData.desc = 'Ván đấu đã bị từ chối!!!';
            await interaction.editReply({ embeds: [getEmbed()], components: [] });
            return buttonConnection.stop();
        }
        const enemyBalance = await orca.balance(enemy.id);
        const myBalance = await orca.balance(interaction.user.id);
        if (enemyBalance < amount || myBalance < amount) {
            embedData.desc = 'Một trong hai người không đủ tiền để tiếp tục chơi ván đấu này';
            await interaction.editReply({ embeds: [getEmbed()], components: [] });
            return buttonConnection.stop();
        }
        orca.add(enemy.id, -amount);
        orca.add(me.id, -amount);

        for (let j = 0; j < bullets.length; j++) {
            const turn = players[j % 2];
            if (bullets[j]) {
                embedData.color = '#CD212A';
                embedData.desc = `**LƯỢT ${j + 1}**\n:exploding_head::gun: Lượt của ${turn}. BÙM, bạn thua và bị trừ **${amount.toLocaleString('vi-VI')}** ${coin}!!!`;
                if (j % 2) {
                    orca.add(me.id, amount * 2);
                }
                else {
                    orca.add(enemy.id, amount * 2);
                }

                await interaction.editReply({ embeds: [getEmbed()], components: [] });
                return buttonConnection.stop();
            }
            embedData.color = '#00A591';
            embedData.desc = `**LƯỢT ${j + 1}**\n:confounded::gun: Lượt của ${turn}.  Ổ đạn rỗng, bạn tạm thời không sao!!!`;
            await interaction.editReply({ embeds: [getEmbed()], components: [] });
            await wait(4000);
        }
    });

    buttonConnection.on('end', () => {
        embedData.title = embedData.title + ' (Đã hết hạn)';
        return interaction.editReply({ embeds: [getEmbed()], components: [] });
    });

    return interaction.editReply({ embeds: [getEmbed()], components: [buttonSet] });
};

module.exports = { rr };