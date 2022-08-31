const { Exp } = require(__dirname + '/../db/dbObjects.js');

// Hàm xử lý vi phạm
// Nếu vi phạm sẽ bị trừ ([số điểm vi phạm] - [số điểm vi phạm] % 5) * 4 EXP <=> 5 điểm VP trừ 20EXP, trên 5 điểm VP thì xử lý;
const punishment = async (interaction, victim, reason, data) => {
    const points = data.violation_points;
    let punish;
    if (!reason) reason = 'không rõ';
    if (points - points % 5 > 0) {
        punish = `Bạn bị trừ ${(points - points % 5) * 4} EXP, reset điểm vi phạm.`;
        await Exp.add(victim.id, -((points - points % 5) * 4));
        data.violation_points = 0;
        await data.save();
    }
    else {
        punish = 'Chưa bị phạt';
    }
    return await interaction.reply(`${victim}, bạn đã bị phạt!\nSố điểm vi phạm hiện tại: ${points}\nLí do: ${reason} (▀̿Ĺ̯▀̿ ̿)\nHình thức phạt: **${punish}**`);
};

module.exports = { punishment };