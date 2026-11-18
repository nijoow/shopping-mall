import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

// .env.local 로드 (dotenv 의존성 없이 동작)
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const match = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (!match) return;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] ??= value;
    });
}

async function listProducts() {
  try {
    const { rows } = await sql`SELECT * FROM products`;
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

listProducts();
