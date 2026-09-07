import pg from 'pg';
const { Client } = pg;

async function testPostgres() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No hay DATABASE_URL");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW() as time');
    console.log("✅ Conexion a la base de datos Postgres exitosa!", res.rows[0].time);
  } catch (err) {
    console.error("❌ Error de conexion a Postgres:", err.message);
  } finally {
    await client.end();
  }
}

testPostgres();
