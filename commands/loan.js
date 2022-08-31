const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Loan } = require(__dirname + '/../db/dbObjects.js');
const { orca } = require(__dirname + '/../modules/market.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loan')
		.setDescription('Yêu cầu vay tiền')
        .addIntegerOption(option =>
            option
            .setName('amount')
            .setDescription('Số tiền muốn vay')
            .setRequired(true),
            ),
	execute(interaction) {
        const target = interaction.user;
        const amount = Math.ceil(interaction.options.getInteger('amount'));
        if (amount < 1000000) return interaction.reply({ content: 'Số tiền vay tối thiểu là 1.000.000 <:orcacoin:1012692278109798540>', ephemeral: true });
        if (amount > 250000000) return interaction.reply({ content: 'Số tiền vay tối đa là 250.000.000 <:orcacoin:1012692278109798540>', ephemeral: true });
        Loan.findByPk(target.id).then(async data => {
            if (data) {
                return interaction.reply('Bạn đang có sẵn một khoản nợ. Bạn không thể tiếp tục vay');
            }
            else {
                Loan.create({ 'user_id': target.id, 'amount': amount }).then(async (created) => {
                    const loanTime = (new Date(created.createdAt)).getTime();
                    const embed = new EmbedBuilder()
                        .setTitle('VAY THÀNH CÔNG!!')
                        .setColor('#00A591')
                        .setDescription('**Lưu ý**: Nếu trả quá hạn, mỗi ngày một lần bạn sẽ bị trừ số EXP tỉ lệ với khoản tiền vay.')
                        .addFields(
                            { 'name': 'Người vay', 'value': '`' + target.tag + '`', inline: true },
                            { 'name': 'Số tiền vay', 'value': '**' + created.amount.toLocaleString('vi-VI') + '** <:orcacoin:1012692278109798540>', inline: true },
                            { 'name': 'Thời hạn trả', 'value': (new Date(loanTime + 1000 * 3600 * 24 * 3)).toLocaleDateString('vi-VI') },
                            { 'name': 'Lãi suất', 'value': '10%/ngày' },
                        );
                    await orca.add(target.id, amount);
                    return await interaction.reply({ embeds: [embed] });
                });
            }
        }, err => console.error(err));
	},
};