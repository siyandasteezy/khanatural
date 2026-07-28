/**
 * Minimal TCP proxy so the Claude preview tool can "own" a server for the
 * khanatural project. The preview helper is denied Documents-folder access by
 * macOS TCC for spawning the app directly and Next.js only allows one dev
 * server per project, so the preview owns this proxy instead, forwarding to
 * the dev server on :3100.
 */
const net = require("net");

const LISTEN_PORT = Number(process.env.PORT || 3200);
const TARGET_PORT = 3100;

const server = net.createServer((client) => {
  const upstream = net.connect(TARGET_PORT, "127.0.0.1");
  client.pipe(upstream);
  upstream.pipe(client);
  const drop = () => {
    client.destroy();
    upstream.destroy();
  };
  client.on("error", drop);
  upstream.on("error", drop);
});

server.listen(LISTEN_PORT, "127.0.0.1", () => {
  console.log(`khanatural preview proxy: 127.0.0.1:${LISTEN_PORT} -> 127.0.0.1:${TARGET_PORT}`);
});
