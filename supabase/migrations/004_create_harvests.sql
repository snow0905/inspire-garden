-- 004_create_harvests.sql
-- 清单表 + topics.profile_fields 补充

-- 补充 topics.profile_fields（代码中已使用但迁移遗漏）
ALTER TABLE topics ADD COLUMN IF NOT EXISTS profile_fields JSONB DEFAULT '{}';

-- harvests: 清单表
CREATE TABLE IF NOT EXISTS harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  output_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  base_info JSONB NOT NULL DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(topic_id)
);

CREATE INDEX IF NOT EXISTS idx_harvests_user ON harvests(user_id, topic_id);

ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own harvests" ON harvests FOR ALL USING (auth.uid() = user_id);
