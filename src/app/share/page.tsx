"use client";

import { useEffect } from "react";

/**
 * Redirect page that opens iMessage with a pre-filled text about caltodo.
 * Used in email campaigns where sms: links are blocked by email clients.
 */
export default function SharePage() {
  useEffect(() => {
    window.location.href =
      "sms:?body=hey you should try this, its free for lifetime rn\n\nhttps://caltodo.me";
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "system-ui" }}>
      <p style={{ color: "#666", fontSize: "15px" }}>opening messages...</p>
    </div>
  );
}
