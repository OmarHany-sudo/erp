const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const cors = require("cors");

const app = express();

// فعل CORS
app.use(cors({
  origin: "*", // ينفع تحدد لينك معين زي "http://localhost:3000"
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// SQLite Database (file-based)
const db = new sqlite3.Database('meliora.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create tables and pre-populate data
db.serialize(() => {
  // 1. General Ledger
  db.run(`CREATE TABLE IF NOT EXISTS gl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    account TEXT,
    description TEXT,
    debit REAL,
    credit REAL
  )`);
  db.run(`INSERT OR IGNORE INTO gl (date, account, description, debit, credit) VALUES 
    ('2024-03-15', 'Cash', 'Payment from customer', 500.00, 0.00),
    ('2024-03-15', 'Accounts Receivable', 'Payment from customer', 0.00, 500.00),
    ('2024-03-16', 'Inventory', 'Purchase of goods', 1200.00, 0.00),
    ('2024-03-16', 'Accounts Payable', 'Purchase of goods', 0.00, 1200.00),
    ('2024-03-17', 'Salaries Expense', 'Employee salaries', 3000.00, 0.00),
    ('2024-03-17', 'Cash', 'Employee salaries', 0.00, 3000.00),
    ('2024-03-18', 'Rent Expense', 'Office rent', 1500.00, 0.00),
    ('2024-03-18', 'Cash', 'Office rent', 0.00, 1500.00),
    ('2024-03-19', 'Sales Revenue', 'Sales to customer', 0.00, 2500.00)`);

  // 2. Accounts Payable
  db.run(`CREATE TABLE IF NOT EXISTS ap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier TEXT,
    invoiceNo TEXT,
    date TEXT,
    dueDate TEXT,
    amount REAL,
    status TEXT
  )`);
  db.run(`INSERT OR IGNORE INTO ap (supplier, invoiceNo, date, dueDate, amount, status) VALUES 
    ('Global Supplies Inc.', 'INV-2024-001', '2024-07-15', '2024-08-14', 5000.00, 'Paid'),
    ('Tech Solutions Ltd.', 'INV-2024-002', '2024-07-16', '2024-08-15', 2500.00, 'Pending'),
    ('Office Essentials Co.', 'INV-2024-003', '2024-07-17', '2024-08-16', 1200.00, 'Paid'),
    ('Industrial Parts Corp.', 'INV-2024-004', '2024-07-18', '2024-08-17', 7500.00, 'Overdue'),
    ('Software Innovations LLC', 'INV-2024-005', '2024-07-19', '2024-08-18', 3000.00, 'Pending'),
    ('Marketing Services Group', 'INV-2024-006', '2024-07-20', '2024-08-19', 1800.00, 'Paid'),
    ('Logistics Solutions Inc.', 'INV-2024-007', '2024-07-21', '2024-08-20', 4200.00, 'Pending'),
    ('Financial Consulting LLC', 'INV-2024-008', '2024-07-22', '2024-08-21', 6800.00, 'Paid'),
    ('HR Support Services Co.', 'INV-2024-009', '2024-07-23', '2024-08-22', 2100.00, 'Pending'),
    ('Legal Advisory Group', 'INV-2024-010', '2024-07-24', '2024-08-23', 9000.00, 'Overdue')`);

  // 3. Accounts Receivable
  db.run(`CREATE TABLE IF NOT EXISTS ar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT,
    invoiceNo TEXT,
    date TEXT,
    dueDate TEXT,
    amount REAL,
    status TEXT
  )`);
  db.run(`INSERT OR IGNORE INTO ar (customer, invoiceNo, date, dueDate, amount, status) VALUES 
    ('Tech Solutions Inc.', 'INV-2024-001', '2024-07-15', '2024-08-14', 5000.00, 'Paid'),
    ('Global Innovations LLC', 'INV-2024-002', '2024-07-20', '2024-08-19', 7500.00, 'Pending'),
    ('Dynamic Systems Corp', 'INV-2024-003', '2024-07-25', '2024-08-24', 3200.00, 'Overdue'),
    ('Innovative Designs Ltd.', 'INV-2024-004', '2024-07-30', '2024-08-29', 10000.00, 'Paid'),
    ('Strategic Ventures Group', 'INV-2024-005', '2024-08-05', '2024-09-04', 6800.00, 'Pending'),
    ('Apex Industries Co.', 'INV-2024-006', '2024-08-10', '2024-09-09', 4500.00, 'Paid'),
    ('Pinnacle Enterprises Inc.', 'INV-2024-007', '2024-08-15', '2024-09-14', 8200.00, 'Pending'),
    ('Summit Technologies Ltd.', 'INV-2024-008', '2024-08-20', '2024-09-19', 2900.00, 'Overdue'),
    ('Horizon Solutions LLC', 'INV-2024-009', '2024-08-25', '2024-09-24', 12000.00, 'Paid')`);

  // 4. Cost Centers
  db.run(`CREATE TABLE IF NOT EXISTS cost_centers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    department TEXT,
    budget REAL,
    actual REAL
  )`);
  db.run(`INSERT OR IGNORE INTO cost_centers (name, description, department, budget, actual) VALUES 
    ('Marketing Expenses', 'Expenses related to marketing activities', 'Marketing', 50000, 45000),
    ('R&D Expenses', 'Expenses related to research and development', 'R&D', 100000, 90000),
    ('Sales Expenses', 'Expenses related to sales activities', 'Sales', 75000, 70000),
    ('Operations Expenses', 'Expenses related to operational activities', 'Operations', 120000, 110000),
    ('Admin Expenses', 'General administrative expenses', 'Admin', 60000, 55000)`);

  // 5. Project Budgets
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    budget REAL,
    expenses REAL,
    remaining REAL,
    status TEXT
  )`);
  db.run(`INSERT OR IGNORE INTO projects (name, budget, expenses, remaining, status) VALUES 
    ('Project Alpha', 50000, 35000, 15000, 'On Track'),
    ('Project Beta', 75000, 80000, -5000, 'Over Budget'),
    ('Project Gamma', 100000, 60000, 40000, 'Under Budget'),
    ('Project Delta', 60000, 55000, 5000, 'On Track'),
    ('Project Epsilon', 40000, 42000, -2000, 'Over Budget')`);

  // 6. P&L Statements
  db.run(`CREATE TABLE IF NOT EXISTS pl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account TEXT,
    q1 REAL,
    q2 REAL,
    change TEXT
  )`);
  db.run(`INSERT OR IGNORE INTO pl (account, q1, q2, change) VALUES 
    ('Revenue', 500000, 550000, '+10%'),
    ('Cost of Goods Sold', 200000, 220000, '+10%'),
    ('Gross Profit', 300000, 330000, '+10%'),
    ('Salaries', 50000, 55000, '+10%'),
    ('Rent', 20000, 20000, '0%'),
    ('Marketing', 30000, 35000, '+17%'),
    ('Other Expenses', 10000, 12000, '+20%'),
    ('Total Operating Expenses', 110000, 122000, '+11%'),
    ('Net Income', 190000, 208000, '+9%')`);

  // 7. Balance Sheet
  db.run(`CREATE TABLE IF NOT EXISTS balance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    item TEXT,
    value REAL
  )`);
  db.run(`INSERT OR IGNORE INTO balance (category, item, value) VALUES 
    ('Assets', 'Cash', 50000),
    ('Assets', 'Accounts Receivable', 30000),
    ('Assets', 'Inventory', 20000),
    ('Assets', 'Prepaid Expenses', 5000),
    ('Assets', 'Total Current Assets', 105000),
    ('Assets', 'Property, Plant, and Equipment', 200000),
    ('Assets', 'Less: Accumulated Depreciation', -50000),
    ('Assets', 'Total Fixed Assets', 150000),
    ('Assets', 'Total Assets', 255000),
    ('Liabilities', 'Accounts Payable', 25000),
    ('Liabilities', 'Accrued Expenses', 10000),
    ('Liabilities', 'Deferred Revenue', 5000),
    ('Liabilities', 'Total Current Liabilities', 40000),
    ('Liabilities', 'Long-Term Debt', 100000),
    ('Liabilities', 'Total Liabilities', 140000),
    ('Equity', 'Common Stock', 50000),
    ('Equity', 'Retained Earnings', 65000),
    ('Equity', 'Total Equity', 115000),
    ('Equity', 'Total Liabilities and Equity', 255000)`);

  // 8. Cash Flow
  db.run(`CREATE TABLE IF NOT EXISTS cashflow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity TEXT,
    details TEXT,
    amount REAL
  )`);
  db.run(`INSERT OR IGNORE INTO cashflow (activity, details, amount) VALUES 
    ('Operating Activities', 'Net Income', 50000),
    ('Operating Activities', 'Depreciation', 10000),
    ('Operating Activities', 'Changes in Working Capital', -5000),
    ('Operating Activities', 'Subtotal Operating Activities', 55000),
    ('Investing Activities', 'Purchase of Equipment', -20000),
    ('Investing Activities', 'Sale of Investments', 15000),
    ('Investing Activities', 'Subtotal Investing Activities', -5000),
    ('Financing Activities', 'Proceeds from Loans', 30000),
    ('Financing Activities', 'Repayment of Loans', -10000),
    ('Financing Activities', 'Dividends Paid', -5000),
    ('Financing Activities', 'Subtotal Financing Activities', 15000),
    ('Net Change in Cash', '', 65000),
    ('Beginning Cash Balance', '', 100000),
    ('Ending Cash Balance', '', 165000)`);

  // 9. Bank Reconciliation
  db.run(`CREATE TABLE IF NOT EXISTS reconciliation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bankBalance REAL,
    bookBalance REAL,
    reconcilingItems REAL
  )`);
  db.run(`INSERT OR IGNORE INTO reconciliation (bankBalance, bookBalance, reconcilingItems) VALUES 
    (10500.00, 10000.00, 500.00)`);

  // 10. Payments
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paymentId TEXT,
    date TEXT,
    payee TEXT,
    amount REAL,
    description TEXT
  )`);
  db.run(`INSERT OR IGNORE INTO payments (paymentId, date, payee, amount, description) VALUES 
    ('PAY001', '2024-07-26', 'Tech Solutions Inc.', 500.00, 'Software License'),
    ('PAY002', '2024-07-25', 'Office Supplies Co.', 150.00, 'Office Supplies'),
    ('PAY003', '2024-07-24', 'Marketing Agency', 1200.00, 'Marketing Services'),
    ('PAY004', '2024-07-23', 'Consulting Group', 800.00, 'Consulting Fees'),
    ('PAY005', '2024-07-22', 'Equipment Supplier', 2500.00, 'Equipment Purchase'),
    ('PAY006', '2024-07-21', 'Training Provider', 300.00, 'Employee Training'),
    ('PAY007', '2024-07-20', 'Travel Agency', 450.00, 'Business Travel'),
    ('PAY008', '2024-07-19', 'Legal Services', 600.00, 'Legal Consultation'),
    ('PAY009', '2024-07-18', 'Insurance Company', 200.00, 'Insurance Premium'),
    ('PAY010', '2024-07-17', 'Maintenance Services', 100.00, 'Office Maintenance')`);
});

// Helper function for CRUD operations with input validation
const crudRoutes = (table) => {
  app.get(`/${table}`, (req, res) => {
    console.log(`GET /${table}`);
    db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: `Failed to fetch ${table}: ${err.message}` });
      } else {
        res.json({ success: true, data: rows });
      }
    });
  });

  app.post(`/${table}`, (req, res) => {
    console.log(`POST /${table}`, req.body);
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }
    const keys = Object.keys(req.body).join(', ');
    const values = Object.values(req.body);
    const placeholders = values.map(() => '?').join(', ');

    db.run(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`, values, function (err) {
      if (err) {
        return res.status(500).json({ error: `Failed to add to ${table}: ${err.message}` });
      }

      // ====== ERP LOGIC: Automatic Double-Entry Bookkeeping ======
      const lastId = this.lastID;
      const entry = req.body;

      // 1. When an Accounts Payable invoice is added, create a GL entry
      if (table === 'ap') {
        const glEntry = [
          { date: entry.date, account: 'Expenses', description: `AP Invoice: ${entry.supplier}`, debit: entry.amount, credit: 0 },
          { date: entry.date, account: 'Accounts Payable', description: `Payable to ${entry.supplier}`, debit: 0, credit: entry.amount }
        ];
        glEntry.forEach(e => {
          db.run(`INSERT INTO gl (date, account, description, debit, credit) VALUES (?, ?, ?, ?, ?)`,
                 [e.date, e.account, e.description, e.debit, e.credit]);
        });
      }

      // 2. When an Accounts Receivable invoice is added, create a GL entry
      if (table === 'ar') {
        const glEntry = [
          { date: entry.date, account: 'Accounts Receivable', description: `Receivable from ${entry.customer}`, debit: entry.amount, credit: 0 },
          { date: entry.date, account: 'Sales Revenue', description: `Sale to ${entry.customer}`, debit: 0, credit: entry.amount }
        ];
        glEntry.forEach(e => {
          db.run(`INSERT INTO gl (date, account, description, debit, credit) VALUES (?, ?, ?, ?, ?)`,
                 [e.date, e.account, e.description, e.debit, e.credit]);
        });
      }
      // ===============================================================

      res.json({ success: true, id: lastId });
    });
  });

  app.put(`/${table}/:id`, (req, res) => {
    console.log(`PUT /${table}/:id`, req.params.id, req.body);
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No data provided for update' });
    }
    const sets = Object.keys(req.body).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(req.body), req.params.id];
    db.run(`UPDATE ${table} SET ${sets} WHERE id = ?`, values, (err) => {
      if (err) {
        res.status(500).json({ error: `Failed to update ${table}: ${err.message}` });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.delete(`/${table}/:id`, (req, res) => {
    console.log(`DELETE /${table}/:id`, req.params.id);
    db.run(`DELETE FROM ${table} WHERE id = ?`, req.params.id, (err) => {
      if (err) {
        res.status(500).json({ error: `Failed to delete from ${table}: ${err.message}` });
      } else {
        res.json({ success: true });
      }
    });
  });
};

// Register routes for all tables
crudRoutes('gl');
crudRoutes('ap');
crudRoutes('ar');
crudRoutes('cost_centers');
crudRoutes('projects');
crudRoutes('pl');
crudRoutes('balance');
crudRoutes('cashflow');
crudRoutes('reconciliation');
crudRoutes('payments');

// ====== NEW: Dashboard Summary Endpoint ======
app.get('/api/dashboard/summary', (req, res) => {
  console.log('GET /api/dashboard/summary');

  const queries = {
    totalRevenue: "SELECT SUM(credit) as total FROM gl WHERE account = 'Sales Revenue'",
        totalExpenses: "SELECT SUM(debit) as total FROM gl WHERE account LIKE '%Expense%'"
  };

  const summary = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  let errorSent = false;

  Object.entries(queries).forEach(([key, sql]) => {
    db.get(sql, [], (err, row) => {
      if (err && !errorSent) {
        errorSent = true;
        return res.status(500).json({ error: `Failed to fetch dashboard data: ${err.message}` });
      }
      if (!errorSent) {
                summary[key] = row ? row.total : 0;
          completed++;
          if (completed === totalQueries) {
            const chartData = {
              labels: ['Revenue', 'Expenses'],
              datasets: [{
                label: 'Financial Overview',
                data: [summary.totalRevenue, summary.totalExpenses],
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 99, 132, 0.8)'
                            ],
                            borderWidth: 1
              }]
            };
                    res.json({ success: true, data: summary, chartData: chartData });
          }
      }
    });
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
//بدأ
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} at ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })}`
  );
});

module.exports = app;


