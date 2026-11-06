/**
 * Browser Socket.IO is not used directly.
 *
 * Social chat still authenticates with `handshake.auth.token` on SocialProfileREM.
 * The member JWT stays HttpOnly. Live updates use the same-origin SSE bridge
 * (`GET /api/chat/stream`) which opens Socket.IO server-side with the cookie token
 * and forwards mobile-equivalent events (`new_message`, `message_sent`, …).
 *
 * Sends use BFF → server Socket.IO (`send_message` / `send_image` / `send_document`).
 */

import { io, type Socket } from "socket.io-client";

type SocketStatus = "idle" | "blocked" | "connecting" | "connected" | "disconnected";

class SocketFoundation {
  private socket: Socket | null = null;
  private status: SocketStatus = "idle";

  getStatus(): SocketStatus {
    return this.status;
  }

  /**
   * Intentionally does not connect in Phase 1.
   * Calling connect without an approved ephemeral credential is a no-op.
   */
  connect(): void {
    this.status = "blocked";
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[socket] Connection deferred. HttpOnly session cannot supply handshake.auth.token. See docs/realtorsin-web-app/phase-1-foundation.md"
      );
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.status = "disconnected";
  }

  /** Reserved for Phase 4 once a secure ticket flow exists. */
  connectWithEphemeralToken(url: string, ephemeralToken: string): Socket {
    if (!ephemeralToken) {
      throw new Error("ephemeralToken is required");
    }
    this.disconnect();
    this.status = "connecting";
    this.socket = io(url, {
      auth: { token: ephemeralToken },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    this.socket.on("connect", () => {
      this.status = "connected";
    });
    this.socket.on("disconnect", () => {
      this.status = "disconnected";
    });
    return this.socket;
  }
}

const globalKey = "__realtorsin_socket_foundation__";

export function getSocketFoundation(): SocketFoundation {
  const g = globalThis as typeof globalThis & {
    [globalKey]?: SocketFoundation;
  };
  if (!g[globalKey]) {
    g[globalKey] = new SocketFoundation();
  }
  return g[globalKey];
}
