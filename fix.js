const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.insumo.update({
    where: { id: 'd0638c19-0073-45ba-97d2-7622dd28ffd2' },
    data: { precioCompra: 80000, costoUnitario: 80, cantidadDisponible: 800 }
  });
  await prisma.gasto.deleteMany({
    where: { insumoId: 'd0638c19-0073-45ba-97d2-7622dd28ffd2', cantidadComprada: 1000 }
  });
  console.log('Done');
}

fix().finally(() => prisma.$disconnect());
