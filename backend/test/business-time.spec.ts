import { businessDayBoundaries, startOfBusinessDay } from "../src/common/time/business-time";

describe("business timezone boundaries", () => {
  it("uses the India calendar day when UTC is still the previous day", () => {
    const now = new Date("2026-09-04T20:00:00.000Z");
    const boundaries = businessDayBoundaries(now, "Asia/Kolkata");
    expect(boundaries.start.toISOString()).toBe("2026-09-04T18:30:00.000Z");
    expect(boundaries.tomorrow.toISOString()).toBe("2026-09-05T18:30:00.000Z");
  });

  it("treats an exact business-day start as today and the previous instant as overdue", () => {
    const start = startOfBusinessDay(new Date("2026-09-05T00:00:00.000Z"), "Asia/Kolkata");
    expect(start.toISOString()).toBe("2026-09-04T18:30:00.000Z");
    expect(new Date(start.getTime() - 1).getTime()).toBeLessThan(start.getTime());
    expect(start.getTime()).toBeLessThan(new Date("2026-09-05T00:00:00.000Z").getTime());
  });
});
