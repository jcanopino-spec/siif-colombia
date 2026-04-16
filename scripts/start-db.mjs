import EmbeddedPostgres from 'embedded-postgres';

const pg = new EmbeddedPostgres({
  databaseDir: './pg-data',
  user: 'siif',
  password: 'siif_dev_2024',
  port: 5433,
  persistent: true,
});

async function main() {
  try {
    // Check if already initialized
    const fs = await import('fs');
    if (!fs.existsSync('./pg-data/data')) {
      console.log('Inicializando PostgreSQL...');
      await pg.initialise();
      console.log('PostgreSQL inicializado');
    }

    console.log('Arrancando PostgreSQL en puerto 5433...');
    await pg.start();
    console.log('PostgreSQL corriendo en puerto 5433');

    try {
      await pg.createDatabase('siif_colombia');
      console.log('Base de datos siif_colombia creada');
    } catch (e) {
      // Database may already exist
      console.log('Base de datos siif_colombia ya existe o fue creada');
    }

    console.log('\nPostgreSQL listo.');
    console.log('URL: postgresql://siif:siif_dev_2024@localhost:5433/siif_colombia');
    console.log('\nPresione Ctrl+C para detener.\n');

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\nDeteniendo PostgreSQL...');
      await pg.stop();
      process.exit(0);
    });
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();
