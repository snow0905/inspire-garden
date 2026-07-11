// src/app/auth/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/constants';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // MVP: 自动确认邮箱，跳过邮件验证
        await fetch('/api/auth/auto-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        });
        setIsLogin(true);
        setPassword('');
        setError('注册成功！请登录。');
      } else {
        setError('注册失败，请稍后再试。');
      }
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${COLORS.warmBrown}4D`,
    color: COLORS.textPrimary,
  };

  return (
    <>
      <style>{`
        .auth-input::placeholder { color: ${COLORS.deepBrown}80; }
        .auth-input:focus { outline: none; box-shadow: 0 0 0 2px ${COLORS.gold}80; }
      `}</style>
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.mistPink} 100%)` }}
      >
        <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🪷</div>
            <h1 className="text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>灵感花园</h1>
            <p className="text-sm mt-1" style={{ color: COLORS.deepBrown }}>
              {isLogin ? '欢迎回来，看看你的花园吧' : '种下第一颗灵感种子'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: COLORS.textPrimary }}>邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input w-full px-4 py-3 rounded-xl bg-white/50"
                style={inputStyle}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: COLORS.textPrimary }}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input w-full px-4 py-3 rounded-xl bg-white/50"
                style={inputStyle}
                placeholder="至少 6 位"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p
                className="text-sm px-4 py-2 rounded-lg"
                style={{ color: COLORS.coral, backgroundColor: `${COLORS.mistPink}80` }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full font-medium text-white transition-all duration-300 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${COLORS.mistPink} 0%, ${COLORS.coral} 100%)` }}
            >
              {loading ? '...' : isLogin ? '进入花园' : '注册'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: COLORS.deepBrown }}>
            {isLogin ? '还没有花园？' : '已经有花园了？'}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-1 hover:underline"
              style={{ color: COLORS.coral }}
            >
              {isLogin ? '创建一个' : '去登录'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
