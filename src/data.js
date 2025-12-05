"use strict";
import fs from 'fs/promises';
import { join } from 'path';

const { DATA_PATH } = process.env;

if (!DATA_PATH) {
  throw new Error('DATA_PATH environment variable is not set.');
}

/**
 * Сохраняет объект в JSON файл.
 * @param {string} fileName - имя файла относительно DATA_PATH
 * @param {any} data - данные для сохранения
 */
export async function save(fileName, data) {
  const filePath = join(DATA_PATH, fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Failed to save file "${filePath}":`, err);
    throw err; // пробрасываем, чтобы вызывающий код мог обработать
  }
}

/**
 * Загружает объект из JSON файла.
 * @param {string} fileName - имя файла относительно DATA_PATH
 * @returns {Promise<any>} - загруженные данные или пустой объект
 */
export async function load(fileName) {
  const filePath = join(DATA_PATH, fileName);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // файл не найден — возвращаем пустой объект
      return {};
    }
    console.error(`Failed to load file "${filePath}":`, err);
    throw err; // пробрасываем другие ошибки
  }
}
