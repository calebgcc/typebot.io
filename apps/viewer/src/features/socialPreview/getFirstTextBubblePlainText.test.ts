import { describe, expect, it } from "bun:test";
import { getFirstTextBubblePlainText } from "./getFirstTextBubblePlainText";

const createTextBubble = (id: string, text: string) => ({
  id,
  type: "text",
  content: {
    richText: [{ type: "p", children: [{ text }] }],
  },
});

const createV6Typebot = (blocks: unknown[]) => ({
  version: "6.1",
  events: [{ id: "start", type: "start", outgoingEdgeId: "edge-1" }],
  edges: [{ id: "edge-1", from: { eventId: "start" }, to: { groupId: "g1" } }],
  groups: [{ id: "g1", title: "Group #1", blocks }],
});

describe("getFirstTextBubblePlainText", () => {
  it("should return the first text bubble of a v6 typebot", () => {
    expect(
      getFirstTextBubblePlainText(
        createV6Typebot([
          { id: "b0", type: "image", content: { url: "https://a.b/c.png" } },
          createTextBubble("b1", "Hello there!"),
          createTextBubble("b2", "Second message"),
        ]),
      ),
    ).toBe("Hello there!");
  });

  it("should follow the start block edge of a pre-v6 typebot", () => {
    expect(
      getFirstTextBubblePlainText({
        version: "5",
        events: null,
        edges: [
          {
            id: "edge-1",
            from: { blockId: "start-block" },
            to: { groupId: "g2", blockId: "b2" },
          },
        ],
        groups: [
          {
            id: "g1",
            blocks: [
              { id: "start-block", type: "start", outgoingEdgeId: "edge-1" },
            ],
          },
          {
            id: "g2",
            blocks: [
              createTextBubble("b1", "Skipped"),
              createTextBubble("b2", "Welcome"),
            ],
          },
        ],
      }),
    ).toBe("Welcome");
  });

  it("should strip variables and collapse whitespace", () => {
    expect(
      getFirstTextBubblePlainText(
        createV6Typebot([createTextBubble("b1", "Hi  {{Name}}, how are you?")]),
      ),
    ).toBe("Hi, how are you?");
  });

  it("should stop at the first input block", () => {
    expect(
      getFirstTextBubblePlainText(
        createV6Typebot([
          { id: "b1", type: "text input" },
          createTextBubble("b2", "After input"),
        ]),
      ),
    ).toBeUndefined();
  });

  it("should truncate long messages", () => {
    const firstMessage = getFirstTextBubblePlainText(
      createV6Typebot([createTextBubble("b1", "a ".repeat(200))]),
    );
    expect(firstMessage?.length).toBe(180);
    expect(firstMessage?.endsWith("…")).toBe(true);
  });

  it("should return undefined for malformed flows", () => {
    expect(
      getFirstTextBubblePlainText({
        version: "6",
        events: "not an array",
        edges: [],
        groups: [],
      }),
    ).toBeUndefined();
  });
});
