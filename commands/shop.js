const { SlashCommandBuilder } = require('discord.js');
const { orca } = require(__dirname + '/../modules/market.js');
const { Shop_item, Wallet } = require(__dirname + '/../db/dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Cửa hàng')
        .addSubcommand(subcommand =>
            subcommand
            .setName('list')
            .setDescription('Xem danh sách hàng hóa'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('buy')
            .setDescription('Mua hàng')
            .addStringOption(option =>
                option
                .setName('name')
                .setDescription('Tên sản phẩm')
                .setRequired(true))
            .addIntegerOption(option =>
                option
                .setName('quantity')
                .setDescription('Số lượng vật phẩm muốn mua')
                .setRequired(true),
            ),
        ),
    async execute(interaction) {
        const subcmd = interaction.options.getSubcommand();
        const query = interaction.options.getString('name');
        const quantity = interaction.options.getInteger('quantity');

        if (subcmd == 'buy') {
            const item = await Shop_item.findByPk(query);

            if (!item) return interaction.reply({ content: 'Không tìm thấy sản phẩm này!', ephemeral:true });
            if ((item.price * quantity) > orca.balance(interaction.user.id)) return interaction.reply({ content: 'Không đủ tiền để mua sản phẩm này', ephemeral:true });
            if (item.price < 0) return interaction.reply({ content: 'Sản phẩm này không thể mua', ephemeral:true });

            const user = await Wallet.findOne({ where: { user_id: interaction.user.id } });
            orca.add(interaction.user.id, -(item.price * quantity));
            await user.addItem(item, quantity);
            return interaction.reply(`${interaction.user} đã mua thành công ${quantity} **${ item.name }** với giá ${ (quantity * item.price).toLocaleString('vi-VI') } ${process.env.COIN}.`);
        }
        if (subcmd == 'list') {
            const list = await Shop_item.findAll();
            return interaction.reply({ content:`${list.map((i, index) => `**${index + 1}**. ${i.name}:  [**${i.price.toLocaleString('vi-VI')}** ${process.env.COIN}]\n-> ${i.desc}`).join('\n\n')}`, ephemeral: true });
        }
    },
};
