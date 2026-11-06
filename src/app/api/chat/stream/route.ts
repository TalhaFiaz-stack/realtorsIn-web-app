import { getSessionToken } from "@/lib/auth/session";
import { connectChatSocket } from "@/lib/socket/server-chat";
import { jsonError } from "@/lib/auth/bff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin SSE bridge to SocialProfileREM Socket.IO.
 * The JWT stays in the HttpOnly cookie; the browser never receives it.
 * Events mirror mobile SocketService listeners used for live chat.
 */
export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return jsonError("Session required", 401, "SESSION_EXPIRED");
  }

  const encoder = new TextEncoder();
  let socket: ReturnType<typeof connectChatSocket> | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // client gone
        }
      };

      socket = connectChatSocket(token, { persistent: true });

      socket.on("connect", () => {
        send("socket_status", { connected: true });
      });

      socket.on("disconnect", () => {
        send("socket_status", { connected: false });
      });

      socket.on("connect_error", (err) => {
        send("socket_status", { connected: false });
        send("socket_error", { message: err.message || "connect_error" });
      });

      const forward = (event: string) => {
        socket?.on(event, (payload: unknown) => {
          send(event, payload ?? {});
        });
      };

      // Mirror mobile SocketService listeners (see SocialProfileREM chatSocket.js)
      forward("new_message");
      forward("message_sent");
      forward("message_delivered");
      forward("conversation_list_update");
      forward("messages_read");
      forward("message_deleted");
      forward("messages_deleted");
      forward("user_typing");
      forward("online_contacts");
      forward("user_online");
      forward("user_offline");
      forward("presence_updated");
      forward("conversation_joined");

      heartbeat = setInterval(() => {
        send("ping", { t: Date.now() });
      }, 25_000);

      const abort = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        try {
          socket?.removeAllListeners();
          socket?.disconnect();
        } catch {
          // ignore
        }
        try {
          controller.close();
        } catch {
          // ignore
        }
      };

      request.signal.addEventListener("abort", abort);
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      try {
        socket?.removeAllListeners();
        socket?.disconnect();
      } catch {
        // ignore
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
