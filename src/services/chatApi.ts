/**
 * chatApi.ts — Client for the ShebaBD AI chat backend.
 *
 * Handles:
 * - POST /api/v1/chat/stream  (SSE streaming)
 * - POST /api/v1/chat/new     (create blank conversation)
 * - GET  /api/v1/chat/history (list conversations)
 * - GET  /api/v1/health       (health check)
 */

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

// ── SSE event shapes ──────────────────────────────────────────────────────────
export type SSEEvent =
  | { type: 'meta';  conversation_id: string; is_new: boolean }
  | { type: 'token'; content: string }
  | { type: 'tool';  name: string; status: 'calling' | 'done' }
  | { type: 'done';  tokens: number }
  | { type: 'error'; message: string };

export interface StreamCallbacks {
  onMeta?:   (conversationId: string, isNew: boolean) => void;
  onToken?:  (token: string) => void;
  onTool?:   (name: string, status: 'calling' | 'done') => void;
  onDone?:   (tokens: number) => void;
  onError?:  (message: string) => void;
}

/**
 * Stream a chat message to the backend via SSE.
 * Returns an AbortController so the caller can cancel mid-stream.
 */
export function streamChat(
  message: string,
  conversationId: string | null,
  callbacks: StreamCallbacks,
  authToken?: string | null,
): AbortController {
  const controller = new AbortController();

  const body = JSON.stringify({
    message,
    ...(conversationId ? { conversation_id: conversationId } : {}),
  });

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  fetch(`${BACKEND}/api/v1/chat/stream`, {
    method:  'POST',
    headers,
    body,
    signal:  controller.signal,
  })
    .then(async res => {
      if (!res.ok) {
        callbacks.onError?.(`Server error ${res.status}`);
        return;
      }
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';          // keep last incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') return;

          try {
            const event = JSON.parse(raw) as SSEEvent;
            switch (event.type) {
              case 'meta':  callbacks.onMeta?.(event.conversation_id, event.is_new); break;
              case 'token': callbacks.onToken?.(event.content);  break;
              case 'tool':  callbacks.onTool?.(event.name, event.status); break;
              case 'done':  callbacks.onDone?.(event.tokens);   break;
              case 'error': callbacks.onError?.(event.message); break;
            }
          } catch {
            // malformed JSON — skip
          }
        }
      }
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        callbacks.onError?.('Connection lost. Is the backend running?');
      }
    });

  return controller;
}

/** Create a new blank conversation. */
export async function createConversation(
  title = 'New conversation',
  authToken?: string | null,
): Promise<string | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`${BACKEND}/api/v1/chat/new`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.conversation_id ?? null;
  } catch {
    return null;
  }
}

/** Quick health check — returns true if backend is reachable. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND}/api/v1/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
