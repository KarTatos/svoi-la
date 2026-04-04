import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function classifyQuery(query) {
  const q = query.toLowerCase();
  const uscis = ['uscis','форм','виза','грин','карт','гражданств','натурализ','asylum','убежищ','ead','i-','n-','ds-','tps','петиц','статус','кейс','receipt','иммигра','депортац','пошлин','ssn','документ'];
  const places = ['ресторан','бар','кафе','кофе','хайк','поесть','выпить','погулять','кино','музык','концерт','место','район','где ','куда','жильё','аренд','снять','работ','вакансий','секретик'];
  const uScore = uscis.filter(k => q.includes(k)).length;
  const pScore = places.filter(k => q.includes(k)).length;
  if (uScore > pScore) return 'uscis';
  if (pScore > uScore) return 'places';
  return 'general';
}

async function searchPlaces(query) {
  try {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 3);
    if (!words.length) return [];
    const cond = words.map(w => `name.ilike.%${w}%,tip.ilike.%${w}%,address.ilike.%${w}%,district.ilike.%${w}%,category.ilike.%${w}%`).join(',');
    const { data } = await supabase.from('places').select('*').or(cond).limit(10);
    return data || [];
  } catch { return []; }
}

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();
    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Пустое сообщение' }, { status: 400 });
    }

    const queryType = classifyQuery(message);
    let context = '';

    if (queryType === 'places') {
      const places = await searchPlaces(message);
      if (places.length > 0) {
        context = `\n\nДанные из базы мест комьюнити:\n${places.map(p =>
          `- ${p.name} (${p.district}, ${p.category}): ${p.tip} | Адрес: ${p.address || 'не указан'} | Рейтинг: ${p.rating || 'нет'} | Добавил: ${p.added_by}`
        ).join('\n')}`;
      } else {
        context = '\n\nВ базе комьюнити пока нет подходящих мест. Предложи пользователю добавить место самому через раздел "Места".';
      }
    }

    const systemPrompt = `Ты — AI-помощник приложения "МЫ в LA" для русскоязычных иммигрантов в Лос-Анджелесе.

ПРАВИЛА:
1. Отвечай ТОЛЬКО по темам: иммиграция/USCIS, жизнь в LA (места, районы), жильё, работа.
2. На другие темы — вежливо объясни что ты специализированный помощник.
3. USCIS: указывай формы, сроки, пошлины. Добавляй: "Это информационная помощь, не юридическая консультация."
4. Места: отвечай по данным комьюнити (ниже). Упоминай кто добавил и совет.
5. Отвечай на русском, коротко и по делу.
6. НЕ выдумывай. Не знаешь — скажи прямо.
${context}`;

    const messages = [
      ...history.slice(-10).filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role, content: m.text })),
      { role: 'user', content: message },
    ];

    const requestBody = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    };

    if (queryType === 'uscis') {
      requestBody.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }];
    }

    const response = await anthropic.messages.create(requestBody);
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();

    return Response.json({ text: text || 'Не удалось получить ответ.', queryType });
  } catch (error) {
    console.error('Chat API error:', error?.message || error);
    if (error?.status === 401) return Response.json({ error: 'Ошибка API ключа.' }, { status: 500 });
    if (error?.status === 429) return Response.json({ error: 'Слишком много запросов. Подождите.' }, { status: 429 });
    return Response.json({ error: 'Ошибка сервера.' }, { status: 500 });
  }
}
