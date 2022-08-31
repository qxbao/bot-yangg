const { SlashCommandBuilder } = require('discord.js');
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('duel')
		.setDescription('Đấu với người chơi khác')
        .addSubcommand(subcmd =>
            subcmd
            .setName('bj')
            .setDescription('Người chơi')
            .addUserOption(option =>
                option
                .setName('target')
                .setDescription('Chọn đối thủ')
                .setRequired(true),
            ).addIntegerOption(option =>
                option
                .setName('bet_amount')
                .setDescription('Số tiền bạn muốn đặt cược')
                .setRequired(true),
            ),
        ).addSubcommand(subcmd =>
            subcmd
            .setName('rr')
            .setDescription('Russian roulette, cò quay nga')
            .addUserOption(option =>
                option
                .setName('target')
                .setDescription('Chọn đối tượng')
                .setRequired(true),
            ).addIntegerOption(option =>
                option
                .setName('bet_amount')
                .setDescription('Số tiền cược gốc')
                .setRequired(true),
            ),
        ),
	async execute(interaction, client) {
        await interaction.deferReply();
        if (interaction.channelId != process.env.LUCKYZONE_ID) return await interaction.editReply({ content: `Vui lòng vào <#${process.env.LUCKYZONE_ID}> để sử dụng lệnh này.` });
        const player = interaction.user;
        const enemy = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('bet_amount');
        const balance = await orca.balance(player.id);
        const enemyBalance = await orca.balance(enemy.id);

        if (amount <= 0) return await interaction.editReply({ content: 'Tiền cược phải lớn hơn 0' });
        if (balance < amount) return await interaction.editReply({ content: 'Bạn không có nhiều tiền đến thế đâu...\nNhập **/loan** để yêu cầu vay tiền, còn thở là còn gỡ.' });
        if (player.id == enemy.id) return await interaction.editReply({ content: 'Đối thủ không thể là bản thân.' });
        if (enemyBalance < amount) return await interaction.editReply({ content: 'Đối thủ không có đủ tiền!' });

        const subcmd = interaction.options.getSubcommand();

        if (subcmd == 'bj') {
            require(__dirname + '/duel/blackjack.js').blackjack(interaction, amount, enemy, orca, client);
        }
        if (subcmd == 'rr') {
            require(__dirname + '/games/rr.js').rr(interaction, amount, orca);
        }
	},
};