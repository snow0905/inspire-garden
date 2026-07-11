-- 002_seed_extended_fields.sql
-- 为 seeds 表添加扩展字段，支持 AI 分类增强和图片上传

ALTER TABLE seeds
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS extracted_fields JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS missing_fields TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS branch TEXT;

CREATE INDEX IF NOT EXISTS idx_seeds_branch ON seeds(topic_id, branch);

-- seed-images 存储桶通过 /api/upload 路由自动创建
