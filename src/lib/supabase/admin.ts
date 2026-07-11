// src/lib/supabase/admin.ts
// 使用 SERVICE_ROLE_KEY 的服务端客户端 —— 仅用于需要管理员权限的操作（Storage 等）
import { createClient } from '@supabase/supabase-js';

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('缺少 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  }

  adminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return adminClient;
}
