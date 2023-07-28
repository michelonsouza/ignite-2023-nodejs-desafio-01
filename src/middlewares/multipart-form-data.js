import { parse } from "csv-parse";

const csvParse = parse({
  delimiter: ",",
  skipEmptyLines: true,
  fromLine: 2,
});

/**
 * @typedef {{id: string; title: string; description: string; completed_at: string | null; created_at: string; updated_at: string}} Task
 */

export async function multipartFormData(request, response) {
  const linesParse = request.pipe(csvParse);

  /**
   * @type {Task[]}
   */
  const tasks = [];

  for await (const line of linesParse) {
    const [title, description] = line;
    /**
     * @type {Task}
     */
    const task = {
      title,
      description,
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    tasks.push(task);
  }

  try {
    request.body = { tasks };
  } catch {
    request.body = null;
  }

  response.setHeader("Content-Type", "application/json");
}
