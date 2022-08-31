const { SlashCommandBuilder } = require('discord.js');
const { Wallet, Shop_item } = require(__dirname + '/../db/dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Kiểm tra túi đồ'),
	async execute(interaction) {
        const target = interaction.user;
        const user = await Wallet.findOne({
            where: { user_id : target.id },
        });
        const items = await user.getItems();
        if (!items.length) return interaction.reply({ content: `${target}, bạn không sở hữu vật phẩm nào :3`, ephemeral: true });
        const filteredItems = async () => {
            const ar = [];
            for (let i = 0; i < items.length; i++) {
                const existence = await Shop_item.findByPk(items[i].name);
                if (existence) {
                    ar.push(` x${items[i].amount} **${items[i].name}**`);
                }
                else {
                    ar.push(` ~~x${items[i].amount} **${items[i].name}**~~`);
                }
            }
            return ar;
        };
        return interaction.reply({
            content: `${target}, bạn hiện đang sở hữu${await filteredItems()}`,
            ephemeral: true,
        });
	},
};