// Chạy file này khi setup (cùng file cmd_deployer) và sau khi có thêm thắt gì trong file dbObjects để khởi tạo || đồng bộ Database

const items = require(__dirname + '/../json/items.json');
const { sequelize, Shop_item } = require(__dirname + '/dbObjects.js');
require(__dirname + '/dbObjects.js').User_item;
require(__dirname + '/dbObjects.js').Wallet;
require(__dirname + '/dbObjects.js').Violation;

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    const shop = [];
    await Shop_item.destroy({ truncate: true });
    items.forEach((element) => {
        shop.push(Shop_item.upsert(element));
    });

    await Promise.all(shop);
    console.log('Đồng bộ hóa database thành công');
    sequelize.close();
}).catch(console.error);