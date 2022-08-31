const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
const app = require('express')();
const port = process.env.PORT || 3000;

// Tạo player âm thanh cho /music
const { Player } = require('discord-player');
require('discord-player/smoothVolume');
const player = new Player(client);

// Khai báo collection chứa các slash commands
client.commands = new Collection();

// Khai báo biến môi trường và các module
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Khai báo đường dẫn, vị trí các file
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Tự động thêm các file slash-handle
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Tự động thêm các file event-handle
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
    else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// File chứa các lệnh được lên lịch
require(__dirname + '/modules/schedule.js').schedule(client);

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
    // Kiểm tra nếu tương tác không phải nhập lệnh

    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction, client, player);
    }
    catch (err) {
        console.log(err);
    }

});

client.login(process.env.TOKEN);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});