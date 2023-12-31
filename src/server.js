import http from "node:http";

import { json } from "./middlewares/json.js";
import { routes } from "./routes.js";
import { extractQueryParams } from "./utils/extract-query-params.js";
import { multipartFormData } from "./middlewares/multipart-form-data.js";

const server = http.createServer(async (request, response) => {
  const { method, url, headers } = request;

  if (headers['content-type'] !== 'multipart/form-data') {
    await json(request, response);
  } else {
    await multipartFormData(request, response);
  }


  const route = routes.find(
    (findRoute) => findRoute.method === method && findRoute.path.test(url)
  );

  if (route) {
    const routeParams = request.url?.match(route.path);

    const { query, ...params } = routeParams?.groups || {};

    request.params = params;
    request.query = extractQueryParams(query);

    return await route.handler(request, response);
  }

  return response
    .writeHead(404)
    .end(JSON.stringify({ message: "Route not found!" }));
});

server.listen(3333);
