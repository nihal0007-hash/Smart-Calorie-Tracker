import time
from collections import deque
from fastapi import HTTPException

class AILimiter:
    def __init__(self):
        # RPM: 5 requests per minute
        self.rpm_limit = 5
        self.rpm_window = 60 # seconds
        self.requests_timestamps = deque()

        # TPM: 250K tokens per minute
        self.tpm_limit = 250000
        self.tpm_window = 60 # seconds
        self.token_usage = deque() # holds tuples of (timestamp, token_count)

        # RPD: 20 requests per day
        self.rpd_limit = 20
        self.rpd_window = 86400 # 24 hours in seconds
        self.daily_requests_timestamps = deque()

    def check_limits(self, estimated_tokens: int):
        now = time.time()

        # 1. Clean up old timestamps
        while self.requests_timestamps and now - self.requests_timestamps[0] > self.rpm_window:
            self.requests_timestamps.popleft()
        
        while self.token_usage and now - self.token_usage[0][0] > self.tpm_window:
            self.token_usage.popleft()
            
        while self.daily_requests_timestamps and now - self.daily_requests_timestamps[0] > self.rpd_window:
            self.daily_requests_timestamps.popleft()

        # 2. Check RPM
        if len(self.requests_timestamps) >= self.rpm_limit:
            raise HTTPException(
                status_code=429, 
                detail="the AI model free tier quota has crossed its limit - pls try after some time."
            )

        # 3. Check TPM
        current_tpm = sum(tokens for _, tokens in self.token_usage)
        if current_tpm + estimated_tokens > self.tpm_limit:
            raise HTTPException(
                status_code=429, 
                detail="the AI model free tier quota has crossed its limit - pls try after some time."
            )

        # 4. Check RPD
        if len(self.daily_requests_timestamps) >= self.rpd_limit:
            raise HTTPException(
                status_code=429, 
                detail="the AI model free tier quota has crossed its limit - pls try after some time."
            )

    def log_request(self, tokens: int):
        now = time.time()
        self.requests_timestamps.append(now)
        self.daily_requests_timestamps.append(now)
        self.token_usage.append((now, tokens))

# Singleton instance
ai_limiter = AILimiter()
