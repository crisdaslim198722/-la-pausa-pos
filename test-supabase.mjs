import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan credenciales en el archivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Probando conexion a Supabase...");
  try {
      const { data, error } = await supabase.from('cualquier_tabla').select('*').limit(1);
      if (error) {
          if (error.code === '42P01') {
             console.log("✅ Conexion exitosa con Supabase API. (El error 42P01 es normal porque la tabla no existe todavia)");
          } else {
             console.error("❌ Error de Supabase:", error);
          }
      } else {
          console.log("✅ Conexion exitosa con Supabase API!");
      }
  } catch(e) {
      console.error("❌ Error de red o inesperado:", e);
  }
}

testConnection();
