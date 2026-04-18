import {
  parseChatContent,
  hasActionInProgress,
  stripPartialActionTag,
} from "./chat-action";

describe("parseChatContent", () => {
  it("returns raw text with null action when no <action> tag present", () => {
    const { visibleContent, action } = parseChatContent("Xin chào!");
    expect(visibleContent).toBe("Xin chào!");
    expect(action).toBeNull();
  });

  it("extracts an `add` action and strips the JSON block from visible content", () => {
    const raw = `Bạn nên thêm quạt.
<action>
{"operation":"add","roomName":"Phòng ngủ","appliance":{"name":"Fan","type":"cooling","wattage":50,"dailyUsageHours":6}}
</action>`;

    const { visibleContent, action } = parseChatContent(raw);

    expect(visibleContent).toBe("Bạn nên thêm quạt.");
    expect(action?.operation).toBe("add");
    if (action?.operation === "add") {
      expect(action.roomName).toBe("Phòng ngủ");
      expect(action.appliance.name).toBe("Fan");
    }
  });

  it("returns null action for invalid JSON inside the tag", () => {
    const raw = `<action>not-json</action>`;
    const { action } = parseChatContent(raw);
    expect(action).toBeNull();
  });

  it("returns null for actions missing required fields", () => {
    const raw = `<action>{"operation":"add"}</action>`;
    const { action } = parseChatContent(raw);
    expect(action).toBeNull();
  });
});

describe("hasActionInProgress", () => {
  it("is false when no opening tag exists", () => {
    expect(hasActionInProgress("plain text")).toBe(false);
  });

  it("is true when the opening tag has not been closed yet", () => {
    expect(hasActionInProgress("prefix <action>{")).toBe(true);
  });

  it("is false once the closing tag is present", () => {
    expect(hasActionInProgress("<action>{}</action>")).toBe(false);
  });
});

describe("stripPartialActionTag", () => {
  it("returns the raw string when there is no action tag", () => {
    expect(stripPartialActionTag("hello")).toBe("hello");
  });

  it("strips content from the opening tag onwards if the tag is unclosed", () => {
    expect(stripPartialActionTag("hi <action>{partial")).toBe("hi");
  });

  it("strips the full action block when it is closed", () => {
    expect(stripPartialActionTag("hi <action>{}</action>")).toBe("hi");
  });
});
