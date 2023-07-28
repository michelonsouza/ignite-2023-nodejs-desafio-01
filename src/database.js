import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  /**
   * @typedef {{id: string; title: string; description: string; completed_at: string | null; created_at: string; updated_at: string}} Task
   * @type Record<string & 'tasks', Task[]>
   */
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  /**
   * `select`
   * @param {string} table - Table name
   * @param {Record<keyof Pick<Task, 'title' | 'description'>, string> | undefined} search - Seach object
   * @returns {Promise<Task[]>>}
   */
  async select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) =>
          row[key]?.toLowerCase()?.includes(value.toLowerCase())
        );
      });
    }
    return data;
  }

  /**
   * `insert`
   * @param {string} table - Table name
   * @param {Task} data - Resource data
   * @returns {Promise<Task>>}
   */
  async insert(table, data) {
    const parsedData = { ...data, id: randomUUID() };
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(parsedData);
    } else {
      this.#database[table] = [parsedData];
    }

    this.#persist();

    return data;
  }
  /**
   * `insertMany`
   * @param {string} table - Table name
   * @param {Task[]} data - Resource data
   * @returns {Promise<Task[]>>}
   */
  async insertMany(table, data) {
    const parsedData = data.map(task => ({...task, id: randomUUID()}));
    if (Array.isArray(this.#database[table])) {
      this.#database[table] = [...this.#database[table], ...parsedData];
    } else {
      this.#database[table] = [...parsedData];
    }

    this.#persist();

    return data;
  }

  /**
   * `delete`
   * @param {string} table - Table name
   * @param {string} id - Resource ID
   * @returns {Promise<void>}
   */
  async delete(table, id) {
    const rowIndex = this.#database[table]?.findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
      return;
    }

    throw new Error();
  }

  /**
   * `update`
   * @param {string} table - Table name
   * @param {string} id - Resource ID
   * @param {Partial<Task>} data - Resource data
   * @returns {Promise<void>}
   */
  async update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const oldData = { ...this.#database[table][rowIndex] };
      const parsedData = Object.entries(data).reduce(
        (accumulator, [key, value]) => {
          if (value) {
            accumulator[key] = value;
          }

          return accumulator;
        },
        {}
      );

      console.log({ oldData, data });
      this.#database[table][rowIndex] = {
        ...oldData,
        ...parsedData,
      };
      this.#persist();
      return;
    }

    throw new Error();
  }
}
