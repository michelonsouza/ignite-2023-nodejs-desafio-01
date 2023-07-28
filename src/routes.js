import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();
/**
 * @typedef {{id: string; title: string; description: string; completed_at: string | null; created_at: string; updated_at: string}} Task
 */

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    async handler(request, response) {
      const { search } = request.query;

      const tasks = await database.select(
        "tasks",
        search &&
          !!Object.keys(search).length && {
            title: search,
            description: search,
          }
      );

      return response.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    async handler(request, response) {
      const { title, description, tasks } = request.body || {};

      if (tasks) {
        await database.insertMany("tasks", tasks);

        return response.writeHead(201).end();
      }

      if (!title || !description) {
        return response
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title and description are required" })
          );
      }

      /**
       * @type {Omit<Task, 'id'>}
       */
      const task = {
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await database.insert("tasks", task);

      return response.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    async handler(request, response) {
      const { id } = request.params;
      const { title, description } = request?.body || {};

      if (!title && !description) {
        return response
          .writeHead(400)
          .end(JSON.stringify({ message: "title or description is required" }));
      }

      try {
        await database.update("tasks", id, { title, description });

        return response.writeHead(204).end();
      } catch (error) {
        return response
          .writeHead(404)
          .end(JSON.stringify({ message: "Task not found" }));
      }
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    async handler(request, response) {
      const { id } = request.params;

      try {
        await database.delete("tasks", id);

        return response.writeHead(204).end();
      } catch (error) {
        return response
          .writeHead(404)
          .end(JSON.stringify({ message: "Task not found" }));
      }
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    async handler(request, response) {
      const { id } = request.params;

      try {
        await database.update("tasks", id, { completed_at: new Date() });

        return response.writeHead(204).end();
      } catch (error) {
        return response
          .writeHead(404)
          .end(JSON.stringify({ message: "Task not found" }));
      }
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks/populate"),
    async handler(request, response) {
      const { tasks } = request.body || {};

      if (!tasks) {
        return response
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title and description are required" })
          );
      }

      await database.insertMany("tasks", tasks);

      return response.writeHead(201).end();
    },
  },
];
