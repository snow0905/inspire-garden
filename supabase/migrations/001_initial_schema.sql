-- 001_initial_schema.sql
-- 灵感花园 MVP 数据库初始化

-- 扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 花园类型枚举
CREATE TYPE garden_type AS ENUM ('travel', 'food', 'shopping', 'life', 'aesthetic');
CREATE TYPE source_type AS ENUM ('image', 'link', 'text');
CREATE TYPE plant_stage AS ENUM ('seed', 'sprout', 'growing', 'bloom', 'fruit');
CREATE TYPE emotion_type AS ENUM ('joy', 'sad', 'calm', 'anxious', 'excited', 'neutral');
CREATE TYPE ai_activity AS ENUM ('passive', 'semi', 'active');
CREATE TYPE emotion_source AS ENUM ('chat', 'manual');

-- profiles: 扩展 auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  garden_name TEXT NOT NULL DEFAULT '我的灵感花园',
  ai_activity ai_activity NOT NULL DEFAULT 'semi',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- topics: 主题（植物）
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_type garden_type NOT NULL,
  topic_name TEXT NOT NULL,
  plant_family TEXT NOT NULL DEFAULT 'flower',
  stage plant_stage NOT NULL DEFAULT 'seed',
  growth_score NUMERIC(5,1) NOT NULL DEFAULT 0,
  density_score NUMERIC(5,1) NOT NULL DEFAULT 0,
  completeness_score NUMERIC(5,1) NOT NULL DEFAULT 0,
  structure_score NUMERIC(5,1) NOT NULL DEFAULT 0,
  can_harvest BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  missing_fields TEXT[] NOT NULL DEFAULT '{}',
  color_variant TEXT NOT NULL DEFAULT '#e5c872',
  fruited_at TIMESTAMPTZ,
  fruited_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- seeds: 灵感种子
CREATE TABLE seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  garden_type garden_type NOT NULL,
  source_type source_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  source_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- chat_sessions: 对话会话
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新的对话',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- chat_messages: 对话消息
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  emotion emotion_type,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- emotion_logs: 情绪记录
CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion emotion_type NOT NULL,
  intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  source emotion_source NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- garden_state: 花园状态快照
CREATE TABLE garden_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_seeds INT NOT NULL DEFAULT 0,
  total_topics INT NOT NULL DEFAULT 0,
  blooming_count INT NOT NULL DEFAULT 0,
  fruited_count INT NOT NULL DEFAULT 0,
  plants JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_topics_user ON topics(user_id, garden_type);
CREATE INDEX idx_seeds_user ON seeds(user_id, topic_id);
CREATE INDEX idx_seeds_topic ON seeds(topic_id);
CREATE INDEX idx_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX idx_emotion_logs_user ON emotion_logs(user_id, created_at);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_state ENABLE ROW LEVEL SECURITY;

-- 用户只能读写自己的数据
CREATE POLICY "Users own profiles" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own topics" ON topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own seeds" ON seeds FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own chat_sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own chat_messages" ON chat_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM chat_sessions WHERE id = chat_messages.session_id AND user_id = auth.uid()));
CREATE POLICY "Users own emotion_logs" ON emotion_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own garden_state" ON garden_state FOR ALL USING (auth.uid() = user_id);

-- 触发器: 新用户自动创建 profile 和 garden_state
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname) VALUES (NEW.id, '园丁_' || substring(NEW.email, 1, 3));
  INSERT INTO garden_state (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
