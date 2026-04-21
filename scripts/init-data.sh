#!/bin/bash
set -e

echo "🚀 Running init-data script..."

SUPER_USER="${POSTGRES_USER:-postgres}"
DB_NAME="study_assistant"

# Проверяем, существует ли база
DB_EXISTS=$(psql -U "$SUPER_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" != "1" ]; then
    echo "📦 Creating database $DB_NAME..."
    psql -v ON_ERROR_STOP=1 --username "$SUPER_USER" --dbname "postgres" <<-EOSQL
        CREATE DATABASE $DB_NAME;
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO "$SUPER_USER";
EOSQL
else
    echo "📦 Database $DB_NAME already exists"
fi

echo "🔧 Setting up pgvector and doc_chunks table in $DB_NAME..."
psql -v ON_ERROR_STOP=1 --username "$SUPER_USER" --dbname "$DB_NAME" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS doc_chunks (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        embedding VECTOR(1536),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding ON doc_chunks USING ivfflat (embedding vector_cosine_ops);

    -- Даём права владельцу (суперпользователю)
    GRANT ALL PRIVILEGES ON TABLE doc_chunks TO "$SUPER_USER";
    GRANT USAGE, SELECT ON SEQUENCE doc_chunks_id_seq TO "$SUPER_USER";

    -- Даём права всем пользователям (чтобы n8n мог подключаться с любым пользователем)
    GRANT ALL PRIVILEGES ON TABLE doc_chunks TO PUBLIC;
    GRANT USAGE, SELECT ON SEQUENCE doc_chunks_id_seq TO PUBLIC;
EOSQL

echo "✅ Database $DB_NAME and doc_chunks table are ready"