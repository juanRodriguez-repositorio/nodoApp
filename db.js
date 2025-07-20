import mysql from 'mysql2';

export const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'organizadordematerias'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Conectado a MySQL');
});
