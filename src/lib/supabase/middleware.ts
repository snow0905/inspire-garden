// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith('/auth');
  const isDemoPath = pathname.startsWith('/demo');
  const isApiRoute = pathname.startsWith('/api/');

  // MVP: 无需认证即可访问的 API 路由白名单
  const publicApis = ['/api/auth/auto-confirm'];
  const isPublicApi = publicApis.includes(pathname);

  // 未登录用户访问 API 路由时返回 401 JSON，而非 302 重定向（公开路由除外）
  if (!user && isApiRoute && !isPublicApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 未登录用户只能访问 /auth、/demo 或公开 API 路由
  if (!user && !isAuthPage && !isPublicApi && !isDemoPath) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 已登录用户访问 /auth 时重定向到首页
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}
