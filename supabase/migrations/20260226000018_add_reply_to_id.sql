-- Add reply_to_id column for message replies.
-- ON DELETE SET NULL: if the replied-to message is deleted, the reply keeps its content.
ALTER TABLE chat_messages ADD COLUMN reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL;

-- Index for looking up replies to a message
CREATE INDEX idx_chat_messages_reply_to ON chat_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
