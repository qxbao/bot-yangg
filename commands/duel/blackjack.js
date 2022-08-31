const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const blackjack = async (interaction, amount, enemy, orca, client) => {
    // Const
    const coin = '<:orcacoin:1012692278109798540>';
    const randomNumber = (Math.floor(Math.random() * 999999)).toString();
    const players = [enemy.id, interaction.user.id];
    // Embed
    const embedData = {
        'color': '#AEBCC4',
        'title': `[DUEL] BLACKJACK #${randomNumber}`,
        'desc': `${interaction.user} đã gửi một lời thách đấu trị giá **${amount.toLocaleString('vi-VI')}** ${coin} tới ${enemy}.\nLiệu bạn có dám đồng ý?`,
    };
    const getEmbed = () => {
        const emb = new EmbedBuilder()
            .setTitle(embedData.title)
            .setDescription(embedData.desc)
            .setColor(embedData.color);
        return emb;
    };
    // Button
    const buttonSet1 = new ActionRowBuilder()
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
    const buttonSet2 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId(`getcard${randomNumber}`)
            .setLabel('Rút bài')
            .setStyle(ButtonStyle.Success),
    ).addComponents(
        new ButtonBuilder()
            .setCustomId(`compare${randomNumber}`)
            .setLabel('Hạ bài')
            .setStyle(ButtonStyle.Danger),
    );
    // FUNCTION BELOW HERE
    const cardName = ['🅰️', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇯', '🇶', '🇰'];
    const playerA = { 'cards': [], 'points': 0, 'q': [] };
    const playerB = { 'cards': [], 'points': 0, 'q': [] };
    const cards = [];
    const status = [0, 0];

    for (let i = 0; i < cardName.length; i++) {
        playerA.q[i] = 0;
        playerB.q[i] = 0;
        let points = i + 1;
        if (i >= 10) points = 10;
        cards.push({ 'points':points, 'q':0, 'name':cardName[i].toString() });
    }

    const getStatus = (param) => {
        if (status[param]) return '(đã hạ bài)';
        return '';
    };

    const getCard = (target, cardArray) => {
        const ran = Math.floor(Math.random() * cardArray.length);
        if (cardArray[ran].q >= 4) return getCard(cardArray);
        target.q[ran]++;
        cardArray[ran].q++;
        target.cards.push(cardArray[ran].name);
        target.points += cardArray[ran].points;
    };

    const startTheGame = async () => {
        await getCard(playerA, cards);
        await getCard(playerB, cards);
        if (playerA.cards.length == 2) {
            return;
        }
        return startTheGame();
    };

    const filter = i => players.includes(i.user.id);
    const buttonConnection = interaction.channel.createMessageComponentCollector({ filter, time: 45000 });

    buttonConnection.on('collect', async (i) => {
        const userId = i.user.id;
        const customId = i.customId;
        if (customId == `accept${randomNumber}`) {
            if (userId != enemy.id) return;
            await startTheGame();
            const userA = await client.users.fetch(interaction.user.id);
            userA.send(`#${randomNumber} Bài của bạn hiện tại: ${playerA.cards.join(' ')}.`);
            const userB = await client.users.fetch(enemy.id);
            userB.send(`#${randomNumber} Bài của bạn hiện tại: ${playerB.cards.join(' ')}.`);
            embedData.desc = `Số lượng bài:\n${interaction.user}: **${playerA.cards.length}**\n${enemy}: **${playerB.cards.length}**`;
            i.deferUpdate();
            return await interaction.editReply({ embeds: [getEmbed()], components: [buttonSet2] });
        }
        if (customId == `decline${randomNumber}`) {
            if (userId != enemy.id) return i.deferUpdate();
            embedData.color = '#CD212A';
            embedData.desc = 'Ván đấu đã bị từ chối!!!';
            await interaction.editReply({ embeds: [getEmbed()], components: [] });
            return buttonConnection.stop();
        }
        if (customId == `getcard${randomNumber}`) {
            if (userId == interaction.user.id) {
                if (status[0]) return;
                await getCard(playerA, cards);
                const userA = await client.users.fetch(interaction.user.id);
                userA.send(`#${randomNumber} Bài của bạn hiện tại: ${playerA.cards.join(' ')}.`);
            }
            else {
                if (status[1]) return i.deferUpdate();
                await getCard(playerB, cards);
                const userB = await client.users.fetch(enemy.id);
                userB.send(`#${randomNumber} Bài của bạn hiện tại: ${playerB.cards.join(' ')}.`);
            }
            embedData.desc = `Số lượng bài:\n${interaction.user}: **${playerA.cards.length}** ${getStatus(0)}\n${enemy}: **${playerB.cards.length}** ${getStatus(1)}`;
            i.deferUpdate();
            return await interaction.editReply({ embeds:[getEmbed()], components: [buttonSet2] });
        }
        if (customId == `compare${randomNumber}`) {
            if (userId == interaction.user.id) {
                status[0] = 1;
                //  Xét xì dách, xì bàn
                if (playerA.cards.length == 2 && playerA.cards.length == playerA.q[0]) {
                    console.log(19);
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n${interaction.user} trúng XÌ BÀN, chúc mừng bạn đã thắng **${amount.toLocaleString('vi-VI')}** ${coin}.`;
                    orca.add(interaction.user.id, amount);
                    orca.add(enemy.id, -amount);
                }
                if (playerA.cards.length == 2 && playerA.q[0] == 1 && (playerA.q[9] || playerA.q[10] || playerA.q[11] || playerA.q[12])) {
                    console.log(18);
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n${interaction.user} trúng XÌ DÁCH, chúc mừng bạn đã thắng **${amount.toLocaleString('vi-VI')}** ${coin}.`;
                    orca.add(interaction.user.id, amount);
                    orca.add(enemy.id, -amount);
                    await interaction.editReply({ embeds:[getEmbed()], components: [] });
                    return buttonConnection.stop();
                }
            }
            else {
                status[1] = 1;
                //  Xét xì dách, xì bàn
                if (playerB.cards.length == 2 && playerB.cards.length == playerB.q[0]) {
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n${enemy} trúng XÌ BÀN, chúc mừng bạn đã thắng **${amount.toLocaleString('vi-VI')}** ${coin}.`;
                    orca.add(interaction.user.id, -amount);
                    orca.add(enemy.id, amount);
                    await interaction.editReply({ embeds:[getEmbed()], components: [] });
                    return buttonConnection.stop();
                }
                if (playerB.cards.length == 2 && playerB.q[0] == 1 && (playerB.q[9] || playerB.q[10] || playerB.q[11] || playerB.q[12])) {
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n${enemy} trúng XÌ DÁCH, chúc mừng bạn đã thắng **${amount.toLocaleString('vi-VI')}** ${coin}.`;
                    orca.add(interaction.user.id, -amount);
                    orca.add(enemy.id, amount);
                    await interaction.editReply({ embeds:[getEmbed()], components: [] });
                    return buttonConnection.stop();
                }
            }
            if (!status.includes(0)) {
                // Tính điểm
                if (playerA.points == playerB.points) {
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n\nHòa!! Cả 2 người chơi đều có số điểm là **${playerA.points}**`;
                    await interaction.editReply({ embeds:[getEmbed()], components: [] });
                    return buttonConnection.stop();
                }
                let winner;
                if (playerA.points > 21 || playerB.points > 21) {
                    // Một trong hai lớn hơn 21 điểm
                    // Hòa
                    // Cùng lớn hơn 21 điểm
                    if (playerA.points > 21 && playerB.points > 21) {
                        if (playerA.points > playerB.points) {
                            // A thua
                            orca.add(interaction.user.id, -amount);
                            orca.add(enemy.id, amount);
                            winner = enemy;
                        }
                        else {
                            orca.add(interaction.user.id, amount);
                            orca.add(enemy.id, -amount);
                            winner = interaction.user;
                            // B thua
                        }
                        embedData.color = '#00A591';
                        embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n\nMặc dù quắc,${winner} vẫn đã chiến thắng **${amount.toLocaleString('vi-VI')}** ${coin}.`;
                        await interaction.editReply({ embeds:[getEmbed()], components: [] });
                        return buttonConnection.stop();
                    }
                    // Xét 1 trong 2 nhỏ hơn 16 điểm
                    if (playerA.points < 16 || playerB.points < 16) {
                        if (playerA.points < playerB.points) {
                            orca.add(interaction.user.id, -amount);
                            orca.add(enemy.id, amount);
                            winner = enemy;
                        }
                        else {
                            orca.add(interaction.user.id, amount);
                            orca.add(enemy.id, -amount);
                            winner = interaction.user;
                        }
                        embedData.color = '#00A591';
                        embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n\n${winner} ĐÃ CHIẾN THẮNG **${amount.toLocaleString('vi-VI')}** ${coin} nhờ đối thủ thua non.`;
                        await interaction.editReply({ embeds:[getEmbed()], components: [] });
                        return buttonConnection.stop();
                    }
                    // A thua vì lớn hơn 21
                    if (playerA.points > 21 && playerB.points <= 21) {
                        orca.add(interaction.user.id, -amount);
                        orca.add(enemy.id, amount);
                        winner = enemy;
                    }
                    else {
                        orca.add(interaction.user.id, amount);
                        orca.add(enemy.id, -amount);
                        winner = interaction.user;
                    }
                    embedData.color = '#00A591';
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n\n${winner} ĐÃ CHIẾN THẮNG **${amount.toLocaleString('vi-VI')}** ${coin}`;
                    await interaction.editReply({ embeds:[getEmbed()], components: [] });
                    return buttonConnection.stop();
                }
                if (playerA.cards.length == 5 || playerB.cards.length == 5) {
                    // XÉT NGŨ LINH
                    // 2 NGŨ LINH
                    if (playerA.cards.length == playerB.cards.length) {
                        // Nhỏ hơn thì thắng
                        if (playerA.points < playerB.points) {
                            orca.add(interaction.user.id, amount);
                            orca.add(enemy.id, -amount);
                            winner = interaction.user;
                        }
                        else {
                            orca.add(interaction.user.id, -amount);
                            orca.add(enemy.id, amount);
                            winner = enemy;
                        }
                        embedData.color = '#00A591';
                        embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n\n${winner} ĐÃ CHIẾN THẮNG **${amount.toLocaleString('vi-VI')}** ${coin} MỘT CÁCH THẦN KỲ!`;
                        await interaction.editReply({ embeds:[getEmbed()], components: [] });
                        return buttonConnection.stop();
                    }
                    // 1 NGŨ LINH
                    if (playerA.cards.length != 5) {
                        orca.add(interaction.user.id, -amount);
                        orca.add(enemy.id, amount);
                        winner = enemy;
                    }
                    else {
                        orca.add(interaction.user.id, amount);
                        orca.add(enemy.id, -amount);
                        winner = interaction.user;
                    }
                    embedData.color = '#00A591';
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n\n${winner} CẦM NGŨ LINH VÀ ĐOẠT ĐƯỢC **${amount.toLocaleString('vi-VI')}** ${coin}`;
                    await interaction.editReply({ embeds:[getEmbed()], components: [] });
                    return buttonConnection.stop();
                }
                if (playerA.points < 16 || playerB.points < 16) {
                    if (playerA.points < playerB.points) {
                        orca.add(interaction.user.id, -amount);
                        orca.add(enemy.id, amount);
                        winner = enemy;
                    }
                    else {
                        orca.add(interaction.user.id, amount);
                        orca.add(enemy.id, -amount);
                        winner = interaction.user;
                    }
                    embedData.color = '#00A591';
                    embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n\n${winner} đã chiến thắng **${amount.toLocaleString('vi-VI')}** ${coin} nhờ đối thủ không đủ 16 điểm.`;
                    await interaction.editReply({ embeds:[getEmbed()], components: [] });
                    return buttonConnection.stop();
                }
                if (playerA.points < playerB.points) {
                    orca.add(interaction.user.id, -amount);
                    orca.add(enemy.id, amount);
                    winner = enemy;
                }
                else {
                    orca.add(interaction.user.id, amount);
                    orca.add(enemy.id, -amount);
                    winner = interaction.user;
                }
                embedData.color = '#00A591';
                embedData.desc = `${interaction.user}: **${playerA.cards.join(' ')}**\n${enemy}: **${playerB.cards.join(' ')}**\n${winner} đạt được điểm cao hơn, chúc mừng bạn đã thắng **${amount.toLocaleString('vi-VI')}** ${coin}.`;
                await interaction.editReply({ embeds:[getEmbed()], components: [] });
                return buttonConnection.stop();
            }
            embedData.desc = `Số lượng bài:\n${interaction.user}: **${playerA.cards.length}** ${getStatus(0)}\n${enemy}: **${playerB.cards.length}** ${getStatus(1)}`;
            i.deferUpdate();
            return await interaction.editReply({ embeds:[getEmbed()], components: [buttonSet2] });
        }
    });

    buttonConnection.on('end', () => {
        if (!status[0]) orca.add(interaction.user.id, -amount);
        if (!status[1]) orca.add(enemy.id, -amount);
        embedData.title = embedData.title + ' (Đã hết hạn)';
        return interaction.editReply({ embeds: [getEmbed()], components: [] });
    });

    return await interaction.editReply({ embeds:[getEmbed()], components: [buttonSet1] });
};
module.exports = { blackjack };