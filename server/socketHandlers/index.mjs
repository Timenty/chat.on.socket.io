import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Получение __dirname и __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для асинхронного импорта модулей
async function importModules() {
  const filesList = fs.readdirSync(__dirname);

  const modules = {};

  for (const fullFileName of filesList) {
    const [fileName, extension] = fullFileName.split('.');

    if (fileName === 'index' || extension !== 'mjs') {
      continue;
    }

    const modulePath = `./${fullFileName}`;
    const module = await import(modulePath);
    modules[fileName] = module.default;
  }

  return modules;
}

// Экспортируем модули
const modules = await importModules();
export default modules;
