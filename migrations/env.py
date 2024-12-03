import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app import db
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# This sets the target_metadata for autogeneration
target_metadata = db.metadata

# The Alembic Config object provides access to the values in the .ini file.
config = context.config

# Interpret the config file for Python logging (this sets up loggers).
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Get the database URL from the environment variable, if set.
database_url = os.getenv("DATABASE_URL","flask_api_db")
if database_url:
    # Set the sqlalchemy.url in the Alembic config dynamically
    config.set_main_option("sqlalchemy.url", database_url)
else:
    raise ValueError("DATABASE_URL environment variable is not set")

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()