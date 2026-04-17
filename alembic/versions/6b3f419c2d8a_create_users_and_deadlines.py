"""create users and deadlines

Revision ID: 6b3f419c2d8a
Revises: 
Create Date: 2026-04-17 22:21:35.473292

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b3f419c2d8a'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tg_user_id", sa.BigInteger(), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=True),
        sa.Column("first_name", sa.String(length=255), nullable=True),
        sa.Column("last_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_tg_user_id", "users", ["tg_user_id"], unique=True)

    op.create_table(
        "deadlines",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
        sa.Column("source_text", sa.Text(), nullable=False),
        sa.Column("source_chat_id", sa.BigInteger(), nullable=True),
        sa.Column("source_message_id", sa.BigInteger(), nullable=True),
        sa.Column("reminded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )

    op.create_index("ix_deadlines_user_id", "deadlines", ["user_id"], unique=False)
    op.create_index("ix_deadlines_due_at", "deadlines", ["due_at"], unique=False)
    op.create_index("ix_deadlines_status", "deadlines", ["status"], unique=False)
    op.create_index("ix_deadlines_source_chat_id", "deadlines", ["source_chat_id"], unique=False)
    op.create_index(
        "ix_deadlines_user_status_due_at",
        "deadlines",
        ["user_id", "status", "due_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_deadlines_user_status_due_at", table_name="deadlines")
    op.drop_index("ix_deadlines_source_chat_id", table_name="deadlines")
    op.drop_index("ix_deadlines_status", table_name="deadlines")
    op.drop_index("ix_deadlines_due_at", table_name="deadlines")
    op.drop_index("ix_deadlines_user_id", table_name="deadlines")
    op.drop_table("deadlines")

    op.drop_index("ix_users_tg_user_id", table_name="users")
    op.drop_table("users")
