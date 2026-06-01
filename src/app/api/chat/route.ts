// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { chatWithQwenStream } from '@/lib/qwen';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { sessionId, message, attachments } = await request.json();

  // 获取或创建对话 session
  let chatSessionId = sessionId;
  if (!chatSessionId) {
    const { data: session } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: message.slice(0, 30) })
      .select('id')
      .single();
    chatSessionId = session?.id;
  }

  // 保存用户消息
  await supabase.from('chat_messages').insert({
    session_id: chatSessionId,
    role: 'user',
    content: message,
  });

  // 获取历史消息（最近 20 条）
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', chatSessionId)
    .order('created_at', { ascending: true })
    .limit(20);

  const messages = (history ?? []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // 调用 Qwen 流式
  try {
    const stream = await chatWithQwenStream(messages);

    // 收集完整回复文本，用于流结束后持久化
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);

        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]' || !data) continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed?.choices?.[0]?.delta?.content;
              if (content) fullResponse += content;
            } catch {
              // 忽略解析失败的行（非 JSON 控制消息）
            }
          }
        }
      },
      flush() {
        if (fullResponse) {
          // 异步持久化，不阻塞 SSE 流关闭
          supabase
            .from('chat_messages')
            .insert({
              session_id: chatSessionId,
              role: 'assistant',
              content: fullResponse,
            })
            .then(({ error }) => {
              if (error) console.error('Failed to save assistant message:', error);
            });
        }
      },
    });

    // 转发 SSE 流（经过 TransformStream 收集文本）
    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Qwen API error:', error);
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
