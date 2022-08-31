const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const blackjack = async (interaction, amount, orca, profile, embed) => {
    const coin = '<:orcacoin:1012692278109798540>';
    const filter = i => i.user.id == interaction.user.id;
    const embedData = { 'color': '#AEBCC4', 'title': `BLACKJACK ${interaction.user.tag.toUpperCase()}`, 'desc': 'Lỗi' };
    const getEmbed = (emb) => {
        emb
        .setTitle(embedData.title)
        .setDescription(embedData.desc)
        .setColor(embedData.color);
        return emb;
    };

    const buttonConnection = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });
    buttonConnection.on('collect', async i => {
        try {
            const customId = i.customId;
            if (customId == 'getcard') {
                await getCard(player, cards);
                const card_list = `:detective: **Bạn**: ${ player.cards.join('') }\n:man_in_tuxedo: **Dealer**: ${ dealer.cards.join('') }\n`;
                if (player.points > 21) {
                    if (dealer.points > player.points) {
                        embedData.color = '#00A591';
                        embedData.desc = `${card_list} Quá 21 điểm nhưng bạn vẫn thắng (◣_◢) .**${amount.toLocaleString('vi-VI')}** ${coin} của bạn đó`;
                        profile.update_profile(amount, true);
                        orca.add(interaction.user.id, amount * 2);
                        await i.update({ embeds: [getEmbed(embed)], components: [] });
                        return buttonConnection.stop();
                    }
                        embedData.desc = `${card_list}**Quắc** ròi. Bạn thua mất tiu **${amount.toLocaleString('vi-VI')}** ${coin}`;
                        embedData.color = '#CD212A';
                        profile.update_profile(-amount);
                        await i.update({ embeds: [getEmbed(embed)], components: [] });
                        return buttonConnection.stop();
                }
                if (player.cards.length == 5) {
                    return compare(i);
                }
                await i.deferUpdate();
                embedData.desc = `Tiền cược: **${amount.toLocaleString('vi-VI')}** ${coin}\nBạn đang cầm ${player.cards.join(' ')}, có muốn tiếp tục?`;
                embedData.color = '#AEBCC4';
                await interaction.editReply({ embeds: [getEmbed(embed)], components: [buttonSet] });
            }
            if (customId == 'compare') {
                return compare(i);
            }
        }
        catch (err) {
            buttonConnection.stop();
        }
    });

    buttonConnection.on('end', () => {
        embedData.title = '*HẾT HẠN TƯƠNG TÁC*';
        return interaction.editReply({ embeds: [getEmbed(embed)], components: [] });
    });

    const compare = async (i) => {
        const card_list = `:detective: **Bạn**: ${ player.cards.join('') }\n:man_in_tuxedo: **Dealer**: ${ dealer.cards.join('') }\n`;
        if (dealer.points > 21) {
            profile.update_profile(amount, true);
            orca.add(interaction.user.id, amount * 2);
            embedData.desc = `${card_list}Dealer điểm cao hơn 21. Bạn thắng **${amount.toLocaleString('vi-VI')}** ${coin}`;
            embedData.color = '#00A591';
            await i.update({ embeds: [getEmbed(embed)], components: [] });
            return buttonConnection.stop();
        }
        if (dealer.cards.length == 5 || player.cards.length == 5) {
            if (player.cards.length < 5 || (dealer.cards.length == player.cards.length && player.points > dealer.points)) {
                profile.update_profile(-amount);
                embedData.desc = `${card_list}**Ngũ linh**?? Bạn thua **${amount.toLocaleString('vi-VI')}** ${coin} rồi.`;
                embedData.color = '#CD212A';
                await i.update({ embeds: [getEmbed(embed)], components: [] });
                return buttonConnection.stop();
            }
            profile.update_profile(amount, true);
            orca.add(interaction.user.id, amount * 2);
            embedData.desc = `${card_list}**NGŨ LINH**, bạn đã thắng **${amount.toLocaleString('vi-VI')}** ${coin}.`;
            embedData.color = '#00A591';
            await i.update({ embeds: [getEmbed(embed)], components: [] });
            return buttonConnection.stop();
        }
        if (player.points < 16) {
            profile.update_profile(-amount);
            embedData.desc = `${card_list}Không đủ 16 điểm, bạn thua **${amount.toLocaleString('vi-VI')}** ${coin}.`;
            embedData.color = '#CD212A';
            await i.update({ embeds: [getEmbed(embed)], components: [] });
            return buttonConnection.stop();
        }
        if (dealer.points == player.points) {
            orca.add(interaction.user.id, amount);
            embedData.desc = `${card_list} Bằng điểm, hòa cả làng.`;
            embedData.color = '#F5DF4D';
            await i.update({ embeds: [getEmbed(embed)], components: [] });
            return buttonConnection.stop();
        }
        if (dealer.points < player.points) {
            profile.update_profile(amount, true);
            orca.add(interaction.user.id, amount * 2);
            embedData.desc = `${card_list}Bạn điểm cao hơn dealer. Bạn thắng **${amount.toLocaleString('vi-VI')}** ${coin}`;
            embedData.color = '#00A591';
            await i.update({ embeds: [getEmbed(embed)], components: [] });
            return buttonConnection.stop();
        }
        profile.update_profile(-amount);
        embedData.desc = `${card_list}Dealer điểm cao hơn, bạn thua **${amount.toLocaleString('vi-VI')}** ${coin}!`;
        embedData.color = '#CD212A';
        await i.update({ embeds: [getEmbed(embed)], components: [] });
        return buttonConnection.stop();
    };

    const buttonSet = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('getcard')
            .setLabel('Rút bài')
            .setStyle(ButtonStyle.Success),
    ).addComponents(
        new ButtonBuilder()
            .setCustomId('compare')
            .setLabel('Dừng')
            .setStyle(ButtonStyle.Danger),
    );

    const cardName = ['<:card_a:1012692930072420394>', '<:card_2:1012692913932730398>', '<:card_3:1012692915799195648>', '<:card_4:1012692917657280624>', '<:card_5:1012692919133667450>', '<:card_6:1012692921776087051>', '<:card_7:1012692923646746644>', '<:card_8:1012692924976336917>', '<:card_9:1012692927031541760>', '<:card_10:1012692928877056131>', '<:card_j:1012692932253458432>', '<:card_q:1012692936015749150>', '<:card_k:1012692934182850622>'];
    const cards = [];
    const player = { 'cards': [], 'points': 0, 'q': [] };
    const dealer = { 'cards': [], 'points': 0, 'q': [] };

    //  Generate card array
    for (let i = 0; i < cardName.length; i++) {
        player.q[i] = 0;
        dealer.q[i] = 0;
        let points = i + 1;
        if (i >= 10) points = 10;
        cards.push({ 'points':points, 'q':0, 'name':cardName[i].toString() });
    }

    const getCard = (target, cardArray) => {
        const ran = Math.floor(Math.random() * cardArray.length);
        if (cardArray[ran].q >= 4) return getCard(cardArray);
        target.q[ran]++;
        cardArray[ran].q++;
        target.cards.push(cardArray[ran].name);
        target.points += cardArray[ran].points;
    };

    const dealerGetCard = () => {
        getCard(dealer, cards);
        if (dealer.points < 16) {
            return dealerGetCard();
        }
        if (dealer.points == 16 || dealer.points == 17) {
            const ran = Math.floor(Math.random() * 1.5);
            if (ran) {
                return dealerGetCard();
            }
        }
    };

    await dealerGetCard();

    const dealingCard = async (getCardFunc, cardArray, playerObj) => {
        await getCardFunc(playerObj, cardArray);
        if (playerObj.cards.length == player.q[0] && playerObj.cards.length == 2) {
            orca.add(player.id, amount * 2);
            embedData.desc = `Bài của bạn: ${playerObj.cards.join(' ')}\n**XÌ BÀN**, bạn thắng **${amount.toLocaleString('vi-VI')}** ${coin}!`;
            embedData.color = '#00A591';
            await interaction.editReply({ embeds: [getEmbed(embed)], components: [] });
            return buttonConnection.stop();
        }
        if (playerObj.cards.length == 2 && playerObj.q[0] == 1 && (playerObj.q[9] || playerObj.q[10] || playerObj.q[11] || playerObj.q[12])) {
            embedData.desc = `Bài của bạn: ${playerObj.cards.join(' ')}\n**XÌ DÁCH**, bạn thắng **${amount.toLocaleString('vi-VI')}** ${coin}!`;
            embedData.color = '#00A591';
            orca.add(player.id, amount * 2);
            await interaction.editReply({ embeds: [getEmbed(embed)], components: [] });
            return buttonConnection.stop();
        }
        if (playerObj.cards.length == 2) {
            embedData.desc = `Tiền cược: **${amount.toLocaleString('vi-VI')}** ${coin}\nBạn đang cầm ${playerObj.cards.join(' ')}, có muốn tiếp tục?`;
            return interaction.editReply({ embeds: [getEmbed(embed)], components: [buttonSet] });
        }
        await dealingCard(getCardFunc, cardArray, playerObj);
    };

    return dealingCard(getCard, cards, player);
};

module.exports = { blackjack };