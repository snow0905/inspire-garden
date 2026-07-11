-- 003_add_seed_fields.sql
-- 新增 wechat 来源类型 + 用户备注字段

ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'wechat';

ALTER TABLE seeds
  ADD COLUMN IF NOT EXISTS user_notes TEXT;
