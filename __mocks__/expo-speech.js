module.exports = {
  speak: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn().mockResolvedValue(undefined),
  resume: jest.fn().mockResolvedValue(undefined),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
  getAvailableVoicesAsync: jest.fn().mockResolvedValue([
    { identifier: 'en-US-1', name: 'Samantha', language: 'en-US', quality: 'Enhanced' },
    { identifier: 'en-US-2', name: 'Alex', language: 'en-US', quality: 'Default' },
    { identifier: 'ko-KR-1', name: 'Yuna', language: 'ko-KR', quality: 'Enhanced' },
    { identifier: 'ar-SA-1', name: 'Maged', language: 'ar-SA', quality: 'Default' },
  ]),
};
