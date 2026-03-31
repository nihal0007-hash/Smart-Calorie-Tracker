from datetime import datetime, timedelta, timezone

# IST is UTC + 5:30
IST = timezone(timedelta(hours=5, minutes=30))

def get_now_ist() -> datetime:
    """Returns the current datetime in IST."""
    return datetime.now(IST)

def ist_today() -> datetime.date:
    """Returns today's date in IST."""
    return get_now_ist().date()

def date_to_ist_range(date_val: datetime.date):
    """Returns (start, end) datetimes for a given IST date."""
    start = datetime(date_val.year, date_val.month, date_val.day, 0, 0, 0, tzinfo=IST)
    end = datetime(date_val.year, date_val.month, date_val.day, 23, 59, 59, 999999, tzinfo=IST)
    return start, end

def ensure_ist(dt: datetime) -> datetime:
    """Ensures a datetime is offset-aware and in IST."""
    if dt.tzinfo is None:
        # If naive, we assume it was meant to be IST/UTC correctly stored
        # Adjust as needed if DB stores as UTC naive
        return dt.replace(tzinfo=IST)
    return dt.astimezone(IST)
