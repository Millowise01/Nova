import { signUpWithRetry, uniqueTestEmail, uniqueTestPhone } from "./users";

describe("uniqueTestPhone / uniqueTestEmail", () => {
  it("produce well-formed phone numbers that are not constant", () => {
    // Uniqueness is only probabilistic: with N = 10^10 values, n draws collide with probability
    // about n^2 / 2N (100,000 draws would collide ~40% of the time; 200 draws, about 2 in a
    // million). Collisions with existing users are handled by signUpWithRetry below, so this
    // only checks the format and that the generator is not stuck.
    const phones = Array.from({ length: 200 }, () => uniqueTestPhone());
    for (const phone of phones) {
      expect(phone).toMatch(/^\+232\d{10}$/); // passes phoneSchema (min 7 characters)
    }
    expect(new Set(phones).size).toBe(200);
  });

  it("keeps the prefix in the email so a failing test is traceable", () => {
    expect(uniqueTestEmail("notif-orderplaced")).toMatch(
      /^notif-orderplaced-[0-9a-f]{8}@example\.test$/,
    );
  });
});

describe("signUpWithRetry", () => {
  const created = { status: 201, body: { data: { user: { id: "u1" }, accessToken: "t1" } } };
  const conflict = (code: string) => ({ status: 409, body: { error: { code } } });

  it("returns the user on the first success without retrying", async () => {
    const attempt = jest.fn().mockResolvedValue(created);
    const result = await signUpWithRetry(attempt);
    expect(result.credentials.email).toContain("@example.test");
    expect(result.response.body.data?.user.id).toBe("u1");
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it.each(["PHONE_ALREADY_REGISTERED", "EMAIL_ALREADY_REGISTERED"])(
    "retries with fresh values when the random test data collides (%s)",
    async (code) => {
      const attempt = jest
        .fn()
        .mockResolvedValueOnce(conflict(code))
        .mockResolvedValueOnce(created);
      await signUpWithRetry(attempt);
      expect(attempt).toHaveBeenCalledTimes(2);
      const [first, second] = attempt.mock.calls.map(([credentials]) => credentials);
      expect(second.phone).not.toBe(first.phone);
      expect(second.email).not.toBe(first.email);
    },
  );

  it("does NOT retry any other failure: it throws with the status and the response body", async () => {
    const attempt = jest.fn().mockResolvedValue({
      status: 400,
      body: { error: { code: "VALIDATION_ERROR", message: "Invalid" } },
    });
    await expect(signUpWithRetry(attempt)).rejects.toThrow(/status 400.*VALIDATION_ERROR/s);
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it("gives up after the attempt limit instead of looping forever, and says how many it tried", async () => {
    const attempt = jest.fn().mockResolvedValue(conflict("PHONE_ALREADY_REGISTERED"));
    await expect(signUpWithRetry(attempt, 3)).rejects.toThrow(
      /3 attempts.*PHONE_ALREADY_REGISTERED/s,
    );
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it("does not treat a rate-limit (429) or a server error as a collision", async () => {
    for (const status of [429, 500]) {
      const attempt = jest.fn().mockResolvedValue({ status, body: { error: { code: "X" } } });
      await expect(signUpWithRetry(attempt)).rejects.toThrow(new RegExp(`status ${status}`));
      expect(attempt).toHaveBeenCalledTimes(1);
    }
  });
});
