import os
import sys
from pathlib import Path

# Add project root and backend directory to Python path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(backend_dir))

# Configure Vercel serverless environment overrides
os.environ["VERCEL"] = "1"
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "sqlite:////tmp/water_sustainability.db"

from app.main import app
