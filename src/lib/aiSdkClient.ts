/**
 * aiSdkClient.ts
 *
 * Custom fetch transport that adapts our FastAPI SSE backend
 * (/api/v1/chat/stream) to the Vercel AI SDK data-stream protocol
 * expected by `useChat`.
 *
 * Vercel AI SDK data-stream format:
 *   text parts:  0:"token"\n
 *   error parts: 3:"message"\n
 *   finish step: e:{...}\n
 *   finish msg:  d:{...}\n
 *
 * Our backend SSE format:
 *   data: {"type":"meta",  "conversation_id":"...","is_new":true}
 *   data: {"type":"token", "content":"..."}
 *   data: {"type":"tool",  "name":"...","status":"calling|done"}
 *   data: {"type":"done",  "tokens":123}
 *   data: [DONE]
 */

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

/**
 * Custom fetch that the `useChat` hook will call.
 * It calls our backend and transforms the response into the
 * Vercel AI SDK data-stream text format so `useChat` can parse it.
 */
export async function shebaChatFetch(
  _url: string | URL | Request,
  options?: RequestInit,
): Promise<Response> {
  // Parse the body that useChat prepared
  let message = '';
  let conversationId: string | null = null;

  if (options?.body) {
    try {
      const parsed = JSON.parse(options.body as string) as {
        messages?: { role: string; content: string }[];
      };
      const msgs = parsed.messages ?? [];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'user') message = last.content;
    } catch {
      /* ignore */
    }
  }

  // Attach JWT if present
  const token = localStorage.getItem('shebabd_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Call our real backend stream endpoint
  const upstream = await fetch(`${BACKEND}/api/v1/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    }),
    signal: options?.signal ?? undefined,
  });

  if (!upstream.ok) {
    // Return an error in AI SDK data-stream format
    const errBody = `3:"Backend error ${upstream.status}"\n`;
    return new Response(errBody, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'x-vercel-ai-data-stream': 'v1' },
    });
  }

  // Transform our SSE stream → Vercel AI SDK data-stream
  const transformedStream = new ReadableStream({
    async start(controller) {
      const reader  = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      const enqueue = (chunk: string) => controller.enqueue(new TextEncoder().encode(chunk));

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') {
              // Finish message — required by Vercel AI SDK
              enqueue(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`);
              controller.close();
              return;
            }

            try {
              const event = JSON.parse(raw) as {
                type: string;
                content?: string;
                name?: string;
                status?: string;
                message?: string;
                tokens?: number;
                conversation_id?: string;
              };

              switch (event.type) {
                case 'token':
                  // Text part — JSON-stringify the token to escape quotes/newlines
                  enqueue(`0:${JSON.stringify(event.content ?? '')}\n`);
                  break;

                case 'tool':
                  // Annotate with tool status so the UI can show it
                  enqueue(`8:${JSON.stringify([{ type: 'tool', name: event.name, status: event.status }])}\n`);
                  break;

                case 'meta':
                  // Annotate with conversation metadata
                  enqueue(`8:${JSON.stringify([{ type: 'meta', conversation_id: event.conversation_id }])}\n`);
                  break;

                case 'error':
                  enqueue(`3:${JSON.stringify(event.message ?? 'Unknown error')}\n`);
                  break;

                case 'done':
                  // Will be followed by [DONE] which triggers close
                  break;
              }
            } catch {
              /* malformed JSON — skip */
            }
          }
        }
      } catch {
        enqueue(`3:${JSON.stringify('Stream interrupted')}\n`);
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(transformedStream, {
    status: 200,
    headers: {
      'Content-Type':          'text/plain; charset=utf-8',
      'x-vercel-ai-data-stream': 'v1',
    },
  });
}
