import {
  calculateDistance,
  interpolatePosition,
  formatTimestamp,
  isValidCoordinate,
  generateId,
  debounce,
  throttle,
} from '../utils';

describe('Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      const pos1 = { lat: 1.3521, lng: 103.8198 };
      const pos2 = { lat: 1.3541, lng: 103.8218 };

      const distance = calculateDistance(pos1, pos2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(5);
    });

    it('should return 0 for identical coordinates', () => {
      const pos = { lat: 1.3521, lng: 103.8198 };
      const distance = calculateDistance(pos, pos);
      expect(distance).toBe(0);
    });
  });

  describe('interpolatePosition', () => {
    it('should interpolate between two positions', () => {
      const start = { lat: 0, lng: 0 };
      const end = { lat: 1, lng: 1 };

      const midpoint = interpolatePosition(start, end, 0.5);
      expect(midpoint).toEqual({ lat: 0.5, lng: 0.5 });

      const quarter = interpolatePosition(start, end, 0.25);
      expect(quarter).toEqual({ lat: 0.25, lng: 0.25 });
    });

    it('should return start position for progress 0', () => {
      const start = { lat: 1, lng: 2 };
      const end = { lat: 3, lng: 4 };

      const result = interpolatePosition(start, end, 0);
      expect(result).toEqual(start);
    });

    it('should return end position for progress 1', () => {
      const start = { lat: 1, lng: 2 };
      const end = { lat: 3, lng: 4 };

      const result = interpolatePosition(start, end, 1);
      expect(result).toEqual(end);
    });
  });

  describe('isValidCoordinate', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinate(1.3521, 103.8198)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinate(91, 103.8198)).toBe(false);
      expect(isValidCoordinate(-91, 103.8198)).toBe(false);
      expect(isValidCoordinate(1.3521, 181)).toBe(false);
      expect(isValidCoordinate(1.3521, -181)).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = '2023-12-01T12:00:00.000Z';
      const formatted = formatTimestamp(timestamp);

      expect(typeof formatted).toBe('string');
      expect(formatted).toContain(':');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});