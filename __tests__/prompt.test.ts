import { z } from "zod";

const promptSchema = z.string().min(3).max(500);

describe("Prompt Validation", () => {
  test("should accept valid prompts", () => {
    const result = promptSchema.safeParse("A beautiful noir cityscape");
    expect(result.success).toBe(true);
  });

  test("should reject short prompts", () => {
    const result = promptSchema.safeParse("Ab");
    expect(result.success).toBe(false);
  });

  test("should reject extremely long prompts", () => {
    const longPrompt = "a".repeat(501);
    const result = promptSchema.safeParse(longPrompt);
    expect(result.success).toBe(false);
  });
});
