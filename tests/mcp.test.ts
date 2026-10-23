import { describe, expect, it } from "vitest";
import { handleRpc, TOOL_NAME } from "@/lib/mcp";
import { POST } from "@/app/api/mcp/route";
import { SITE_URL } from "@/lib/site";

const app = { name: "Test App", description: "A test", url: "https://example.test" };

describe("handleRpc", () => {
  it("answers initialize with server info", () => {
    const response = handleRpc({ jsonrpc: "2.0", id: 1, method: "initialize" }, app);
    expect(response).toMatchObject({ id: 1, result: { serverInfo: { name: "Test App" } } });
  });

  it("lists the single app-info tool", () => {
    const response = handleRpc({ jsonrpc: "2.0", id: "a", method: "tools/list" }, app);
    expect(response).toMatchObject({ result: { tools: [{ name: TOOL_NAME }] } });
  });

  it("returns MCP text content for a known tool", () => {
    const response = handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: TOOL_NAME } }, app);
    expect(response).toEqual({ jsonrpc: "2.0", id: 2, result: { content: [{ type: "text", text: JSON.stringify(app) }] } });
  });

  it("rejects unknown tools, unknown methods, and malformed requests", () => {
    expect(handleRpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "nope" } }, app)).toMatchObject({ error: { code: -32602 } });
    expect(handleRpc({ jsonrpc: "2.0", id: 4, method: "nope" }, app)).toMatchObject({ error: { code: -32601 } });
    expect(handleRpc({ hello: "world" }, app)).toMatchObject({ id: null, error: { code: -32600 } });
  });

  it("does not reply to unknown notifications", () => {
    expect(handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" }, app)).toBeNull();
  });
});

describe("POST /api/mcp", () => {
  const post = (body: string) => POST(new Request("https://example.test/api/mcp", { method: "POST", body }));

  it("answers a real request and echoes its id", async () => {
    const response = await post(JSON.stringify({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: TOOL_NAME } }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.id).toBe(7);
    expect(JSON.parse(json.result.content[0].text)).toMatchObject({ url: SITE_URL });
  });

  it("returns a JSON-RPC parse error for a body that is not JSON", async () => {
    const response = await post("{not json");
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ id: null, error: { code: -32700 } });
  });

  it("accepts notifications with 202 and no body", async () => {
    const response = await post(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }));
    expect(response.status).toBe(202);
    expect(await response.text()).toBe("");
  });
});
