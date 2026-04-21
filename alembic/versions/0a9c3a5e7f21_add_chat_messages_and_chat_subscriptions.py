"""add chat messages and chat subscriptions

Revision ID: 0a9c3a5e7f21
Revises: 6b3f419c2d8a
Create Date: 2026-04-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0a9c3a5e7f21"
down_revision: Union[str, Sequence[str], None] = "6b3f419c2d8a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("message_id", sa.BigInteger(), nullable=False),
        sa.Column("sender_tg_user_id", sa.BigInteger(), nullable=True),
        sa.Column("sender_username", sa.String(length=255), nullable=True),
        sa.Column("sender_first_name", sa.String(length=255), nullable=True),
        sa.Column("text", sa.Text(), nullable=True),
        sa.Column("reply_to_message_id", sa.BigInteger(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint(
            "chat_id",
            "message_id",
            name="uq_chat_messages_chat_id_message_id",
        ),
    )
    op.create_index(
        "ix_chat_messages_chat_id_sent_at",
        "chat_messages",
        ["chat_id", sa.text("sent_at DESC")],
        unique=False,
    )

    op.create_table(
        "chat_subscriptions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "notify_new_deadlines",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "notify_updates",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "notify_daily_digest",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint(
            "chat_id",
            "user_id",
            name="uq_chat_subscriptions_chat_id_user_id",
        ),
    )


def downgrade() -> None:
    op.drop_table("chat_subscriptions")
    op.drop_index("ix_chat_messages_chat_id_sent_at", table_name="chat_messages")
    op.drop_table("chat_messages")
