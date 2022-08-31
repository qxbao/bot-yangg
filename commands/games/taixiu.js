const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const cau = [];

const taixiu = async (interaction, amount, orca) => {
    const choice = interaction.options.getInteger('choices');
    const coin = '<:orcacoin:1012692278109798540>';
    const result = [];
    const dice = [
        '<:dice_1:1013011455274143774>',
        '<:dice_2:1013011457211895859>',
        '<:dice_3:1013011459208384592>',
        '<:dice_4:1013011460965810196>',
        '<:dice_5:1013011462735794186>',
        '<:dice_6:1013011464300286014>',
    ];
    const userId = interaction.user.id;
    const randomNumber = (Math.floor(Math.random() * 999999)).toString();
    const step = interaction.options.getInteger('step');
    const playersTai = {};
    const playersXiu = {};
    const players = {};
    const embedData = { 'color': '#AEBCC4', 'title': `TÀI XỈU BÀN #${randomNumber}`, 'desc': ':man_in_tuxedo: Đã xóc xong!!! Mời cả nhà đặt cược nào!!\n:question:  :question:  :question:', 'tai': '', 'xiu': '' };
    const getEmbed = () => {
        const emb = new EmbedBuilder()
        .setTitle(embedData.title)
        .setDescription(embedData.desc)
        .setColor(embedData.color)
        .addFields(
            { name: 'Tài', value: embedData.tai, inline: true },
            { name: 'Xỉu', value: embedData.xiu, inline: true },
        );
        return emb;
    };
    const getResultEmbed = () => {
        const emb = new EmbedBuilder()
        .setTitle(embedData.title)
        .setDescription(embedData.desc)
        .setColor(embedData.color);
        return emb;
    };

    const getVal = (json) => {
        const list = [];
        for (const j in json) {
            list.push({ 'user_id': j, 'amount': json[j] });
        }
        if (!list.length) return '*không có ai*';
        return list.map(i => `<@${i.user_id}> : ${i.amount.toLocaleString('vi-VI')} ${coin}`).join('\n');
    };

    const congDiem = (json) => {
        for (const i in json) {
            orca.add(i, json[i] * 2);
        }
    };

    const filter = (i) => i.customId == `tai${randomNumber}` || i.customId == `xiu${randomNumber}`;
    const buttonConnection = interaction.channel.createMessageComponentCollector({ filter, time: 25000 });
    buttonConnection.on('collect', async i => {
        try {
            const customId = i.customId;
            const playerId = i.user.id;
            const balance = await orca.balance(playerId);
            if (!Object.prototype.hasOwnProperty.call(players, playerId)) {
                players[playerId] = 0;
            }
            if (step >= balance) {
                return i.deferUpdate();
            }
            orca.add(playerId, -step);
            if (customId == `tai${randomNumber}`) {
                if (!Object.prototype.hasOwnProperty.call(playersTai, playerId)) {
                    playersTai[playerId] = 0;
                }
                playersTai[playerId] += step;
            }
            if (customId == `xiu${randomNumber}`) {
                if (!Object.prototype.hasOwnProperty.call(playersXiu, playerId)) {
                    playersXiu[playerId] = 0;
                }
                playersXiu[playerId] += step;
            }
            players[playerId] += step;
            embedData.tai = getVal(playersTai);
            embedData.xiu = getVal(playersXiu);
            await interaction.editReply({ embeds: [getEmbed()], components: [buttonSet] });
            return i.deferUpdate();
        }
        catch (err) {
            console.error(err);
            buttonConnection.stop();
        }
    });

    buttonConnection.on('end', async () => {
        try {
            let total = 0;
            embedData.color = '#F5DF4D';
            for (let i = 0; i < result.length; i++) {
                total += result[i];
            }
            if (result[0] == result [1] && result[1] == result[2]) {
                embedData.desc = `**BỘ BA ĐỒNG NHẤT!!!**\n${result.map(i => dice[i - 1]).join(' ')}\nCả làng cùng thua!!`;
                return interaction.editReply({ embeds: [getResultEmbed()], components: [] });
            }
            if (total >= 11) {
                cau.push(':white_circle:');
                embedData.desc = `**LÀ TÀI!!!**\n${result.map(i => dice[i - 1]).join(' ')}\nDanh sách người thắng gồm:\n${getVal(playersTai)}\n**Thống kê** (5 gần nhất): ${cau.slice(-5).join(' - ')}`;
                congDiem(playersTai);
                return interaction.editReply({ embeds: [getResultEmbed()], components: [] });
            }
            else {
                // xỉu
                cau.push(':black_circle:');
                embedData.desc = `**LÀ XỈU!!!**\n${result.map(i => dice[i - 1]).join(' ')}\nDanh sách người thắng gồm:\n${getVal(playersXiu)}\n**Thống kê** (5 gần nhất): ${cau.slice(-5).join(' - ')}`;
                congDiem(playersXiu);
                return interaction.editReply({ embeds: [getResultEmbed()], components: [] });
            }
        }
        catch {
            console.error;
        }
    });

    const getResult = () => {
        const ran = Math.ceil(Math.random() * 6);
        return ran;
    };
    const buttonSet = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId(`tai${randomNumber}`)
            .setLabel(`${step.toLocaleString('vi-VI')} Tài`)
            .setEmoji('1012692278109798540')
            .setStyle(ButtonStyle.Success),
    ).addComponents(
        new ButtonBuilder()
            .setCustomId(`xiu${randomNumber}`)
            .setLabel(`${step.toLocaleString('vi-VI')} Xỉu`)
            .setEmoji('1012692278109798540')
            .setStyle(ButtonStyle.Danger),
    );

    // Nhận kết quả
    for (let i = 0; i < 3;i++) {
        result[i] = getResult();
    }
    players[userId] = amount;
    if (choice) {
        playersTai[userId] = amount;
    }
    else {
        playersXiu[userId] = amount;
    }
    embedData.tai = await getVal(playersTai);
    embedData.xiu = await getVal(playersXiu);
    return interaction.editReply({ embeds: [getEmbed()], components: [buttonSet] });

};

module.exports = { taixiu };