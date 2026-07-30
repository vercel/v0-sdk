type V0JsonResult = {
  data: unknown
  error?: unknown
  response: Response
}

export function toV0JsonResponse(result: V0JsonResult, data: unknown = result.data) {
  return Response.json(result.error === undefined ? data : result.error, {
    status: result.response.status,
  })
}
