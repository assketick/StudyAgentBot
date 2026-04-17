#!/bin/bash
set -e

echo "🚀 Running init-data script..."

if [ -n "${POSTGRES_NON_ROOT_USER:-}" ] && [ -n "${POSTGRES_NON_ROOT_PASSWORD:-}" ]; then
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
		DO
		\$\$
		BEGIN
			IF NOT EXISTS (
				SELECT FROM pg_catalog.pg_roles
				WHERE rolname = '${POSTGRES_NON_ROOT_USER}'
			) THEN
				CREATE ROLE "${POSTGRES_NON_ROOT_USER}" LOGIN PASSWORD '${POSTGRES_NON_ROOT_PASSWORD}';
			END IF;
		END
		\$\$;

		GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO "${POSTGRES_NON_ROOT_USER}";
		GRANT CREATE ON SCHEMA public TO "${POSTGRES_NON_ROOT_USER}";
	EOSQL

	DB_EXISTS=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='study_assistant'")

	if [ "$DB_EXISTS" != "1" ]; then
		psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE study_assistant OWNER \"${POSTGRES_NON_ROOT_USER}\";"
	fi

	psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "GRANT ALL PRIVILEGES ON DATABASE study_assistant TO \"${POSTGRES_NON_ROOT_USER}\";"

	echo "✅ User and databases are ready"
else
	echo "⚠️ SETUP INFO: POSTGRES_NON_ROOT_USER or POSTGRES_NON_ROOT_PASSWORD not set"
fi