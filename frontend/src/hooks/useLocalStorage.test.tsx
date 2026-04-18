import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "test-key";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("initializes with the value already stored in localStorage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "abc");

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY));

    // effect runs after initial render
    await act(async () => {});
    expect(result.current[0]).toBe("abc");
  });

  it("writes updates back to localStorage", async () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY));

    await act(async () => {
      result.current[1]("home-123");
    });

    expect(result.current[0]).toBe("home-123");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("home-123");
  });
});
