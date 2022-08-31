const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});
// Khai báo các schema

const Violation = sequelize.define('violation', {
    user_id : {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    violation_points : {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

const Wallet = sequelize.define('wallet', {
    user_id : {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    orca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, { timestamps: false });

const Shop_item = sequelize.define('shop_item', {
    name: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    desc: {
        type: DataTypes.TEXT,
    },
}, { timestamps:false });

const User_item = sequelize.define('user_item', {
    user_id: DataTypes.STRING,
    name : DataTypes.STRING,
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, { timestamps:false });

const Loan = sequelize.define('loan', {
    user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    paid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
});

const Casino_profile = sequelize.define('casino_profile', {
    user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    games_played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    won: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    profit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    row: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
});

const Exp = sequelize.define('exp', {
    user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    exp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

// Khai báo các thuộc tính của các schema

Reflect.defineProperty(Wallet.prototype, 'addItem', {
	value: async function(item, quantity = 1) {
		const userItem = await User_item.findOne({
			where: { user_id: this.user_id, name: item.name },
		});

		if (userItem) {
			userItem.amount += Number(quantity);
			return userItem.save();
		}

		return User_item.create({ user_id: this.user_id, name: item.name, amount: quantity });
	},
});

Reflect.defineProperty(Wallet.prototype, 'getItems', {
    value: function() {
        return User_item.findAll({
			where: { user_id: this.user_id },
		});
    },
});

Reflect.defineProperty(Casino_profile, 'get_profile', {
    value: async (id) => {
        const profile = await Casino_profile.findOne({ where: { user_id: id } });
        return profile;
    },
});

Reflect.defineProperty(Casino_profile, 'create_profile', {
    value: async (id) => {
        const profile = await Casino_profile.create({ user_id: id });
        return profile;
    },
});

Reflect.defineProperty(Casino_profile.prototype, 'update_profile', {
    value: async function(profit, won = false) {
        if (won) this.won++;
        this.profit += profit;
        this.games_played++;
        return this.save();
    },
});

Reflect.defineProperty(Casino_profile.prototype, 'set_row', {
    value: async function(bool) {
        if (bool) {
            this.row++;
        }
        else {
            this.row = 0;
        }
        return this.save();
    },
});

Reflect.defineProperty(Exp, 'add', {
    value: async (user_id, amount) => {
        const profile = await Exp.findByPk(user_id);
        if (profile) {
            profile.exp += amount;
            if (profile.exp < 0) profile.exp = 0;
            return await profile.save();
        }
        return Exp.create({ 'user_id': user_id, 'exp': amount });
    },
});

module.exports = { sequelize, Violation, Wallet, Shop_item, User_item, Casino_profile, Loan, Exp };