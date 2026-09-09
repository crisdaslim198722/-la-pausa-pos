const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando reseteo de base de datos...");
  // Orden de borrado importa por las llaves foraneas
  await prisma.detallePedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.gasto.deleteMany();
  await prisma.recetaItem.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.insumo.deleteMany();
  console.log("¡Base de datos limpiada con éxito! Lista para empezar de ceros.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
