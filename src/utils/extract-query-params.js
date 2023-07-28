/**
 * `extractQueryParams`
 * @param {string | undefined} query
 * @returns {Record<string, string>}
 */
export function extractQueryParams(query) {
  if (!query) {
    return {};
  }

  return query
    .substring(1)
    .split("&")
    .reduce((accumulator, param) => {
      const [key, value] = param.split("=");
      return { ...accumulator, [key]: value };
    }, {});
}
