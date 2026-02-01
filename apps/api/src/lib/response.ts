/**
 * Standard JSON responses for OpenAPI SuccessResponse / ErrorResponse.
 */
export function jsonResponse(body: object, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(
  error: string,
  message: string,
  status: number,
  details?: object
): Response {
  return jsonResponse(
    { success: false, error, message, ...(details && { details }) },
    status
  );
}
