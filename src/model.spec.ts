import { Prescription } from "./model";

describe('Prescription', () => {
  it('should be valid', () => {
    expect(new Prescription().takes).not.toBe(null);
  });
  describe('schedule', () => {
    it('should be valid', () => {
      expect(new Prescription().schedule(new Date(2024,0,1)))
        .toEqual({ numDays: 14 });
    });
  });
});
