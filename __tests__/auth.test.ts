import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name is too short").optional(),
});

describe("Authentication Validation", () => {
  test("should accept a valid email and password", () => {
    const result = authSchema.safeParse({
      email: "test@zenwall.app",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  test("should reject invalid emails", () => {
    const result = authSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email address");
    }
  });

  test("should reject short passwords", () => {
    const result = authSchema.safeParse({
      email: "test@zenwall.app",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 6 characters");
    }
  });

  test("should reject short first names during signup", () => {
    const result = authSchema.safeParse({
      email: "test@zenwall.app",
      password: "password123",
      firstName: "A",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("First name is too short");
    }
  });
});
