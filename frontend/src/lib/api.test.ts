import { setupHome, getDashboard } from "./api";

describe("api client", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;
  });

  function mockJsonResponse(body: unknown, ok = true): void {
    fetchMock.mockResolvedValueOnce({
      ok,
      json: async () => body,
    });
  }

  describe("setupHome", () => {
    it("POSTs the rooms payload and returns the success envelope", async () => {
      mockJsonResponse({
        success: true,
        data: { homeId: "h1", rooms: [] },
      });

      const res = await setupHome([
        { name: "Living", type: "living_room", size: "medium" },
      ]);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/home/setup"),
        expect.objectContaining({ method: "POST" })
      );
      expect(res.success).toBe(true);
    });

    it("returns a typed error envelope when the server returns success:false", async () => {
      mockJsonResponse({ success: false, error: "boom" });

      const res = await setupHome([]);

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe("boom");
      }
    });

    it("returns an error envelope when the response has an unexpected shape", async () => {
      mockJsonResponse({ unexpected: true });

      const res = await setupHome([]);

      expect(res.success).toBe(false);
    });

    it("returns an error envelope when fetch throws (network failure)", async () => {
      fetchMock.mockRejectedValueOnce(new Error("network down"));

      const res = await setupHome([]);

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe("network down");
      }
    });
  });

  describe("getDashboard", () => {
    it("GETs /api/energy/:homeId/dashboard", async () => {
      mockJsonResponse({ success: true, data: {} });

      await getDashboard("home-42");

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/energy/home-42/dashboard"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });
});
