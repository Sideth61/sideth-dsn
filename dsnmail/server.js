const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'DSN_SUPER_SECRET_KEY_2026'; // អាចប្ដូរតាមចំណូលចិត្ត

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // ទុកដាក់ file HTML ក្នុង folder public

// ទិន្នន័យគណនី និង ប្រតិបត្តិការ (Mock Database)
let account = {
    accountId: "DSN-998877",
    name: "Sideth61",
    pin: "@sidet@",
    balance: 1500.00
};

let transactions = [
    { id: 1, type: "deposit", amount: 500.00, note: "ប្រាក់កាសបៀវត្សរ៍ដំបូង", date: "2026-08-30 10:00:00" },
    { id: 2, type: "deposit", amount: 1000.00, note: "ទុនរកស៊ីឆ្នាំ 2026", date: "2026-08-30 10:30:00" }
];

// Middleware សម្រាប់ផ្ទៀងផ្ទាត់ Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: "Unauthorized: គ្មានสิทธิ์ចូលប្រើប្រាស់!" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden: Token មិនត្រឹមត្រូវ ឬអស់សុពលភាព!" });
        req.user = user;
        next();
    });
};

// API: ចូលគណនី (Login)
app.post('/api/login', (req, res) => {
    const { name, pin } = req.body;

    if (name === account.name && pin === account.pin) {
        const token = jwt.sign({ name: account.name }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ token });
    }

    res.status(401).json({ error: "ឈ្មោះ ឬ Password មិនត្រឹមត្រូវទេ ❌" });
});

// API: បង្ហាញព័ត៌មានគណនី និង ប្រតិបត្តិការ (/me)
app.get('/api/me', verifyToken, (req, res) => {
    res.json({
        account: {
            accountId: account.accountId,
            name: account.name,
            balance: account.balance
        },
        transactions: transactions.sort((a, b) => b.id - a.id) // បង្ហាញប្រតិបត្តិការថ្មីមុន
    });
});

// API: ដាក់ប្រាក់ ឬ ដកប្រាក់ (/transactions)
app.post('/api/transactions', verifyToken, (req, res) => {
    const { type, amount, note } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
        return res.status(400).json({ error: "ចំនួនទឹកប្រាក់មិនត្រឹមត្រូវទេ!" });
    }

    if (type === 'deposit') {
        account.balance += parsedAmount;
    } else if (type === 'withdraw') {
        if (account.balance < parsedAmount) {
            return res.status(400).json({ error: "សមតុល្យក្នុងគណនីមិនគ្រាន់ទេ! 😅" });
        }
        account.balance -= parsedAmount;
    } else {
        return res.status(400).json({ error: "ប្រភេទប្រតិបត្តិការមិនត្រឹមត្រូវ!" });
    }

    const newTx = {
        id: transactions.length + 1,
        type,
        amount: parsedAmount,
        note: note ? note : "គ្មានកំណត់ចំណាំ",
        date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    transactions.push(newTx);

    res.json({
        success: true,
        message: "ប្រតិបត្តិការជោគជ័យ!",
        newBalance: account.balance
    });
});

// ចាប់ផ្តើម Server
app.listen(PORT, () => {
    console.log(`🚀 DSN Bank Server đangដំណើរការនៅទីតាំង៖ http://localhost:${PORT}`);
});
