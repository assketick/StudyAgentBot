"""add available_chats

Revision ID: a1b2c3d4e5f6
Revises: 0a9c3a5e7f21
Create Date: 2026-04-24 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "0a9c3a5e7f21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "available_chats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("chat_title", sa.Text(), nullable=True),
        sa.Column("added_by_tg_user_id", sa.BigInteger(), nullable=True),
        sa.Column(
            "added_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("chat_id", name="uq_available_chats_chat_id"),
    )
    op.create_index("ix_available_chats_chat_id", "available_chats", ["chat_id"])


def downgrade() -> None:
    op.drop_index("ix_available_chats_chat_id", table_name="available_chats")
    op.drop_table("available_chats")
