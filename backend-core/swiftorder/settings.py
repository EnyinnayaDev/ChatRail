"""
Django settings for OPay SwiftOrder backend-core.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-only-change-me")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "orders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "swiftorder.urls"
WSGI_APPLICATION = "swiftorder.wsgi.application"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": []},
}]

USE_SQLITE = os.getenv("USE_SQLITE", "False").lower() == "true"

if USE_SQLITE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "HOST": os.getenv("DB_HOST", "localhost"),
            "NAME": os.getenv("DB_NAME", "swiftorder"),
            "USER": os.getenv("DB_USER", "swiftorder"),
            "PASSWORD": os.getenv("DB_PASSWORD", "swiftorder"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
}

# Wide-open CORS for local dev — both frontends hit us directly.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# --- OPay sandbox (PLACEHOLDER) ---
OPAY_SANDBOX_BASE_URL = os.getenv("OPAY_SANDBOX_BASE_URL",
                                  "https://sandbox.opay-placeholder.example/api/v1")
OPAY_MERCHANT_ID = os.getenv("OPAY_MERCHANT_ID", "PLACEHOLDER_MERCHANT")
OPAY_PUBLIC_KEY = os.getenv("OPAY_PUBLIC_KEY", "PLACEHOLDER_PUBLIC_KEY")
OPAY_SECRET_KEY = os.getenv("OPAY_SECRET_KEY", "PLACEHOLDER_SECRET_KEY")
