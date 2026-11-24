from datetime import datetime, timezone


def ahora() -> datetime:
    # Todas las fechas se guardan en UTC
    return datetime.now(timezone.utc)
