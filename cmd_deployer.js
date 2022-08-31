// VUI LÒNG CHẠY FILE NÀY TRƯỚC TIÊN VÀ SAU KHI CÓ ĐIỀU CHỈNH VỀ CÁC SLASH_COMMAND
// ĐỂ KHAI BÁO VỚI DISCORD SỰ THAY ĐỔI, ĐỒNG THỜI THAY ĐỔI TRÊN CON BOT CỦA CÁC BẠN
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Lệnh đã được đăng ký thành công.'))
	.catch(console.error);