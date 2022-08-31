const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { orca } = require(__dirname + '/../modules/market.js');
const { Casino_profile, Exp } = require(__dirname + '/../db/dbObjects.js');
const wait = require('node:timers/promises').setTimeout;
const coin = '<:orcacoin:1012692278109798540>';

const slot_machine = (arr) => {
    const foo = [];
    for (let i = 0; i < 3; i++) {
        foo.push(Math.floor(Math.random() * (arr.length - 1) + 0.5));
    }
    return foo;
};

const rpsSymbol = [
    ':v:', ':punch:', ':hand_splayed:',
];

const coin_side = [ 'sấp', 'ngửa' ];

const slotSymbol = [
    '<:slot_bomb:1012384200160190484>',
    '<:slot_avcd:1012692238989545532>',
    '<:npa:1012643745151320176>',
    '<:ductrinh:1012644249315049542>',
    '<:slot_orca:1012384206086750289>',
];

const check_slot = (array) => {
    for (let i = 0; i < array.length; i++) {
        if (array[0] != array[i]) {
            return false;
        }
    }
    return true;
};

const slots_winning = (number) => {
    return (7.6 * (number) + 2.2);
};

const giveRole = (level, oldlevel, interaction) => {
	const member = interaction.member;
    const role1 = interaction.guild.roles.cache.find(r => r.name == 'Level 10');
    const role2 = interaction.guild.roles.cache.find(r => r.name == 'Level 20');
    const role3 = interaction.guild.roles.cache.find(r => r.name == 'Level 30');
    const role4 = interaction.guild.roles.cache.find(r => r.name == 'Level 40');
    const role7 = interaction.guild.roles.cache.find(r => r.name == 'Level 70');
    const role10 = interaction.guild.roles.cache.find(r => r.name == 'Level 100');

    if (level >= 10 && level <= 20 && oldlevel < 10) {
        member.roles.add(role1);
    }
    if (level >= 20 && level <= 30 && oldlevel < 20) {
        member.roles.remove(role1);
        member.roles.add(role2);
    }
    if (level >= 30 && level <= 40 && oldlevel < 30) {
        member.roles.remove(role1);
        member.roles.remove(role2);
        member.roles.add(role3);
    }
    if (level >= 40 && level <= 70 && oldlevel < 40) {
        member.roles.remove(role1);
        member.roles.remove(role2);
        member.roles.remove(role3);
        member.roles.add(role4);
    }
    if (level >= 70 && level <= 100 && oldlevel < 70) {
        member.roles.remove(role1);
        member.roles.remove(role2);
        member.roles.remove(role3);
        member.roles.remove(role4);
        member.roles.add(role7);
    }
    if (level >= 100 && oldlevel < 100) {
        member.roles.remove(role1);
        member.roles.remove(role2);
        member.roles.remove(role3);
        member.roles.remove(role4);
        member.roles.remove(role7);
        member.roles.add(role10);
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Go casinooooo!!!')
        .addSubcommand(sub =>
            sub
            .setName('dice')
            .setDescription('Đổ xúc xắc')
            .addIntegerOption(option =>
                option
                .setName('side')
                .setDescription('Mặt xúc xắc dự đoán (từ 1-6)')
                .setRequired(true)
                .addChoices(
                    { name: '1', value: 1 },
                    { name: '2', value: 2 },
                    { name: '3', value: 3 },
                    { name: '4', value: 4 },
                    { name: '5', value: 5 },
                    { name: '6', value: 6 },
                ),
            ).addIntegerOption(option =>
                option
                    .setName('bet_amount')
                    .setDescription('Số tiền muốn đặt cược')
                    .setRequired(true),
            ),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('flip')
            .setDescription('Tung đồng xu')
            .addIntegerOption(option =>
                option
                .setName('side')
                .setDescription('Mặt đồng xu bạn chọn')
                .setRequired(true)
                .addChoices(
                    { name: 'Sấp', value: 0 },
                    { name: 'Ngửa', value: 1 },
                ),
            ).addIntegerOption(option =>
                option
                .setName('bet_amount')
                .setDescription('Số tiền muốn đặt cược')
                .setRequired(true),
            ),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('slots')
            .setDescription('Lucky Slots Jackpot!!!')
            .addIntegerOption(option =>
                option
                .setName('bet_amount')
                .setDescription('Số tiền muốn đặt cược')
                .setRequired(true),
            ),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('rps')
            .setDescription('Oẳn tù tì')
            .addIntegerOption(option =>
                option
                .setName('choices')
                .setDescription('Chọn 1')
                .setRequired(true)
                .addChoices(
                { name: 'Kéo', value: 0 },
                { name: 'Đấm', value: 1 },
                { name: 'Lá', value: 2 },
                ),
            ).addIntegerOption(option =>
                option
                .setName('bet_amount')
                .setDescription('Số tiền muốn đặt cược')
                .setRequired(true),
            ),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('bj')
            .setDescription('Blackjack, xì dách')
            .addIntegerOption(option =>
                option
                .setName('bet_amount')
                .setDescription('Số tiền muốn đặt cược')
                .setRequired(true),
            ),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('taixiu')
            .setDescription('Mở một bàn tài xỉu')
            .addIntegerOption(option =>
                option
                .setName('choices')
                .setDescription('Chọn 1')
                .setRequired(true)
                .addChoices(
                { name: 'Tài', value: 1 },
                { name: 'Xỉu', value: 0 },
                ),
            ).addIntegerOption(option =>
                option
                .setName('step')
                .setDescription('Bước cược')
                .setRequired(true)
                .addChoices(
                { name: '100.000', value: 100000 },
                { name: '1.000.000', value: 1000000 },
                { name: '10.000.000', value: 10000000 },
                ),
            ).addIntegerOption(option =>
                option
                .setName('bet_amount')
                .setDescription('Số tiền cược gốc')
                .setRequired(true),
            )),
    async execute(interaction, client) {
        await interaction.deferReply();
        if (interaction.channelId != process.env.LUCKYZONE_ID) return await interaction.editReply({ content: `${player} ,vui lòng vào <#${process.env.LUCKYZONE_ID}> để sử dụng lệnh này.` });
        const player = interaction.user;
        let profile = await Casino_profile.get_profile(player.id);
        if (!profile) {
            await Casino_profile.create_profile(player.id);
            profile = await Casino_profile.get_profile(player.id);
        }
        const amount = interaction.options.getInteger('bet_amount');
        const balance = await orca.balance(player.id);

        let rate = 1;
        if (profile.row > 1) {
            rate = Math.floor(Math.random() * 2 - (profile.row / Math.floor(Math.random() * 4 + 3)) * 0.8 - (amount / balance) * 0.6);
        }

        if (amount <= 0) return await interaction.editReply({ content: 'Tiền cược phải lớn hơn 0' });
        if (balance < amount) return await interaction.editReply({ content: 'Bạn không có nhiều tiền đến thế đâu...\nNhập **/loan** để yêu cầu vay tiền, còn thở là còn gỡ.' });

        const subcmd = interaction.options.getSubcommand();
        const resultEmbed = new EmbedBuilder();
        const embedData = {};
        const exp1 = await Exp.findByPk(interaction.user.id);
        await Exp.add(interaction.user.id, Math.floor(amount / 25000000));
        const exp2 = await Exp.findByPk(interaction.user.id);

        if (exp1) {
            if (Math.floor(exp1.exp / 50) < Math.floor(exp2.exp / 50)) {
                client.channels.cache.get(process.env.LUCKYZONE_ID).send(`Chúc mừng ${interaction.user} đã lên level ${Math.floor(exp2.exp / 50)}`);
                giveRole(Math.floor(exp2.exp / 50), Math.floor(exp1.exp / 50), interaction);
            }
        }
        if (!exp1) {
            if (Math.floor(exp2.exp / 50) > 0) {
                client.channels.cache.get(process.env.LUCKYZONE_ID).send(`Chúc mừng ${interaction.user} đã lên level ${Math.floor(exp2.exp / 50)}`);
                giveRole(Math.floor(exp2.exp / 50), 0, interaction);
            }
        }

        orca.add(player.id, -amount);

        if (subcmd == 'dice') {
            const side = interaction.options.getInteger('side');
            let result = Math.ceil(Math.random() * 6);
            if (rate <= 0) {
                if (side > 1) {
                    result = side - 1;
                }
                else {
                    result = Math.ceil(Math.random() * 5 + 1);
                }
            }

            const dice_img = new AttachmentBuilder(`./images/dice/${result}.png`);

            if (side == result) {
                orca.add(player.id, amount * 7);
                profile.update_profile(amount * 6, true);
                embedData.title = `Là ${result}!! Bạn thắng rồi!!!`;
                profile.set_row(true);
                embedData.desc = `**${(amount * 6).toLocaleString('vi-VI')}** ${coin} đã được bank thẳng vào tài khoản của bạn d(>_・ )`;
                embedData.color = '#00A591';
            }
            else {
                profile.update_profile(-amount);
                profile.set_row(false);
                embedData.title = `Là ${result}!! Bạn thua rồi...`;
                embedData.desc = `Thua keo này ta bày keo khác!!! Nhưng dù sao bạn cũng đã mất **${amount.toLocaleString('vi-VI')}** ${coin}, chơi tiếp nổi không? (´д｀)`;
                embedData.color = '#CD212A';
            }
            return await interaction.editReply({ embeds: [resultEmbed
                .setTitle(embedData.title)
                .setDescription(embedData.desc)
                .setColor(embedData.color)
                .setImage(`attachment://${result}.png`),
            ], files: [dice_img] });
        }

        if (subcmd == 'flip') {
            const side = interaction.options.getInteger('side');
            let result = Math.floor(Math.random() * 2);
            if (rate <= 0) {
                if (side == 1) {
                    result = 0;
                }
                else {
                    result = 1;
                }
            }
            const coin_img = new AttachmentBuilder(`./images/coin/${result}.png`);
            const side_name = coin_side[result];
            if (side == result) {
                orca.add(player.id, amount * 2);
                profile.update_profile(amount, true);
                profile.set_row(true);
                embedData.title = `Là **${ side_name.toUpperCase() }**!! Ghê gớm thiệt!!!`;
                embedData.desc = `**${(amount).toLocaleString('vi-VI')}** ${coin} này thuộc về bạn ヽ(^ᴗ^ヽ) Chơi tiếp thôi!`;
                embedData.color = '#00A591';
            }
            else {
                profile.update_profile(-amount);
                profile.set_row(false);
                embedData.title = `Là **${ side_name.toUpperCase() }**!! Cố gắng lần sau vậy`;
                embedData.desc = `Nói tạm biệt với **${amount.toLocaleString('vi-VI')}** ${coin} này thôi Ψ(\`∇´ # )↝ Dám chơi tiếp không?`;
                embedData.color = '#CD212A';
            }
            await resultEmbed
                .setTitle(embedData.title)
                .setDescription(embedData.desc)
                .setColor(embedData.color)
                .setImage(`attachment://${result}.png`);
            return await interaction.editReply({ embeds: [resultEmbed], files: [coin_img] });
        }

        else if (subcmd == 'slots') {
            const blankSymbol = [':question:', ':question:', ':question:'];
            const result = slot_machine(slotSymbol);
            let msg = '';
            let winning = 0;
            const replyContent = () => {
                return ` ${player} đã đặt cược ${amount.toLocaleString('vi-VI')} ${coin}\n${msg}\n\`__SLOTS__\`\n|${blankSymbol.map(element => element).join('')}|\n\`|       |\`\n\`|       |\`\n`;
            };
            interaction.editReply(replyContent());
            for (let i = 0; i < blankSymbol.length; i++) {
                await wait(700);
                blankSymbol[i] = slotSymbol[result[i]];
                await interaction.editReply(replyContent());
            }
            if (check_slot(result)) {
                winning = Math.ceil(amount * slots_winning(result[0] + 1));
                msg = `và **CHIẾN THẮNG** ${winning.toLocaleString('vi-VI')} ${coin}. Xin chúc mừng`;
                orca.add(player.id, winning + amount);
                profile.update_profile(winning, true);
            }
            else {
                profile.update_profile(-amount);
                msg = 'và **THẤT BẠI**. Hãy thử lại lần sau';
            }
            return interaction.editReply(replyContent());
        }
        if (subcmd == 'rps') {
            let choice = interaction.options.getInteger('choices');
            const result = Math.floor(Math.random() * 3);

            if (choice == 0 && result == 2) choice = 4;
            if (choice == 2 && result == 0) choice = -1;
            if (choice > result) {
                profile.update_profile(amount, true);
                orca.add(player.id, amount * 2);
                embedData.title = `Tui ra ${rpsSymbol[result]}... Bạn đã chiến thắng`;
                embedData.desc = `Thua hoài vậy（πーπ）Đây là ${amount.toLocaleString('vi-VI')} ${coin} của bạn.`;
                embedData.color = '#00A591';
            }
            else if (choice < result) {
                profile.update_profile(-amount);
                embedData.title = `Tui ra ${rpsSymbol[result]}!! Bạn thua rồi`;
                embedData.desc = `${amount.toLocaleString('vi-VI')} ${coin} cứ vậy mà bay đi ~.~\nCó muốn trả thù không nào?`;
                embedData.color = '#CD212A';
            }
            else {
                embedData.title = `Sao tui lại ra ${rpsSymbol[result]} nhỉ?? Hòa mất rồi `;
                embedData.desc = 'Kết quả này không ổn (¬､¬) Chơi lại đi';
                embedData.color = '#AEBCC4';
            }
            interaction.editReply({ embeds:[resultEmbed.setTitle(embedData.title).setDescription(embedData.desc).setColor(embedData.color)] });
        }
        if (subcmd == 'bj') {
            return require(__dirname + '/games/blackjack.js').blackjack(interaction, amount, orca, profile, resultEmbed);
        }
        if (subcmd == 'taixiu') {
            return require(__dirname + '/games/taixiu.js').taixiu(interaction, amount, orca);
        }
    },
};