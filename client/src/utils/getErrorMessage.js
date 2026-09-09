// Errors come back either as a plain string (a business-rule failure, e.g.
// "Course already exists") or an array of Zod issues (schema validation
// failure) - the response shape differs depending on which layer rejected it.
export function getErrorMessage(error) {
  const data = error.response?.data?.error;
  if (Array.isArray(data)) {
    return data[0]?.message || 'Invalid input.';
  }
  return data || 'Something went wrong.';
}
