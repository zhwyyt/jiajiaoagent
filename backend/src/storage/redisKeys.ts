export function sessionKey(sessionId: string) {
  return `jiajiao:session:${sessionId}`;
}

export function sessionTurnKey(sessionId: string) {
  return `jiajiao:session_turn:${sessionId}`;
}

export function orchestrationKey(sessionId: string) {
  return `jiajiao:orchestration:${sessionId}`;
}

export function idempotencyKey(requestId: string) {
  return `jiajiao:idempotency:${requestId}`;
}
