// File chứa chuỗi tập hợp các từ bị cấm
const badword = require(__dirname + '/../json/badword.json');
const { Violation } = require(__dirname + '/../db/dbObjects.js');
const { punishment } = require(__dirname + '/../modules/punishment.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(msg) {
        const msgContent = msg.content;
        if (msg.author.bot) return;
        const sender = msg.guild.members.cache.find(user => user.id === msg.author.id);
        // Kiểm tra xem có từ cấm nào xuất hiện trong tin nhắn hay không
        for (let i = 0; i < badword.length; i++) {
            const bwpattern = new RegExp(`^(.*( ${badword[i]} ).*)$|^(.*( ${badword[i]})$|^(${badword[i]} ).*)$|^(${badword[i]})$`, 'i');
            if (bwpattern.test(msgContent)) {
                // Nếu có thì phạt luôn
                Violation.findByPk(msg.author.id).then(async (data) => {
                    if (data) {
                        data.violation_points++;
                        await data.save();
                        await punishment(msg, sender, 'Sử dụng từ nhạy cảm', data);
                    }
                    else {
                        Violation.create({
                            user_id: msg.author.id,
                            violation_points: 1,
                        }).then((created) => {
                            punishment(msg, sender, 'Sử dụng từ nhạy cảm', created);
                        }, (er) => {
                            console.error(er);
                        });
                    }
                }, (err) => {
                    console.error(err);
                });
                break;
            }
        }
	},
};