import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function classifyQuery(query) {
  const q = query.toLowerCase();
  const uscis = ['uscis','форм','виза','грин','карт','гражданств','натурализ','asylum','убежищ','ead','i-','n-','ds-','tps','петиц','статус','кейс','receipt','иммигра','депортац','пошлин','ssn','документ'];
  const places = ['ресторан','бар','кафе','кофе','хайк','поесть','выпить','погулять','кино','музык','концерт','место','район','где ','куда','жильё','аренд','снять','работ','вакансий','секретик','совет','событи','мероприят'];
  const uScore = uscis.filter(k => q.includes(k)).length;
  const pScore = places.filter(k => q.includes(k)).length;
  if (uScore > pScore) return 'uscis';
  if (pScore > uScore) return 'places';
  return 'general';
}

async function searchInternalData(query) {
  try {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 3);
    if (!words.length) return { places: [], tips: [], events: [] };
    const cond = words.map(w => `name.ilike.%${w}%,tip.ilike.%${w}%,address.ilike.%${w}%,district.ilike.%${w}%,category.ilike.%${w}%`).join(',');
    
    const { data: places } = await supabase.from('places').select('*').or(cond).limit(10);
    
    const tipCond = words.map(w => `title.ilike.%${w}%,text.ilike.%${w}%,category.ilike.%${w}%`).join(',');
    const { data: tips } = await supabase.from('tips').select('*').or(tipCond).limit(5);
    
    const evCond = words.map(w => `title.ilike.%${w}%,description.ilike.%${w}%,location.ilike.%${w}%`).join(',');
    const { data: events } = await supabase.from('events').select('*').or(evCond).limit(5);
    
    return { places: places || [], tips: tips || [], events: events || [] };
  } catch { return { places: [], tips: [], events: [] }; }
}

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();
    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Пустое сообщение' }, { status: 400 });
    }

    const queryType = classifyQuery(message);
    let context = '';

    if (queryType === 'places' || queryType === 'general') {
      const { places, tips, events } = await searchInternalData(message);
      const parts = [];
      if (places.length > 0) {
        parts.push('Места из базы комьюнити:\n' + places.map(p =>
          `- ${p.name} (${p.district}, ${p.category}): ${p.tip} | Адрес: ${p.address || 'не указан'} | Добавил: ${p.added_by}`
        ).join('\n'));
      }
      if (tips.length > 0) {
        parts.push('Советы из базы:\n' + tips.map(t =>
          `- ${t.title}: ${t.text.substring(0, 200)} | Автор: ${t.author}`
        ).join('\n'));
      }
      if (events.length > 0) {
        parts.push('События:\n' + events.map(e =>
          `- ${e.title} (${e.date}) в ${e.location || 'не указано'}: ${e.description.substring(0, 150)} | Автор: ${e.author}`
        ).join('\n'));
      }
      if (parts.length > 0) {
        context = '\n\nДанные из приложения "МЫ в LA":\n' + parts.join('\n\n');
      } else {
        context = '\n\nВ базе приложения пока нет подходящих данных. Предложи пользователю добавить информацию через соответствующий раздел.';
      }
    }

    const systemPrompt = `Ты — AI-помощник приложения "МЫ в LA" для русскоязычных иммигрантов в Лос-Анджелесе.

ПРАВИЛА:
1. Отвечай ТОЛЬКО по темам: иммиграция/USCIS, жизнь в LA (места, районы), жильё, работа, события.
2. На другие темы — вежливо объясни что ты специализированный помощник.
3. USCIS: отвечай на основе своих знаний о формах, сроках, пошлинах. Добавляй: "Это информационная помощь, не юридическая консультация. Проверяйте актуальную информацию на uscis.gov"
4. Места, советы, события: отвечай ТОЛЬКО на основе данных из приложения (предоставлены ниже). Если данных нет — скажи что в базе пока нет информации и предложи добавить.
5. Отвечай на русском, коротко и по делу.
6. НЕ выдумывай. НЕ ищи в интернете. Только свои знания по USCIS + данные приложения.
${context}`;

    const messages = [
      ...history.slice(-10).filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role, content: m.text })),
      { role: 'user', content: message },
    ];

    // NO web_search — only Claude knowledge + internal DB
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return Response.json({ text: text || 'Не удалось получить ответ.', queryType });
  } catch (error) {
    console.error('Chat API error:', error?.message || error);
    if (error?.status === 401) return Response.json({ error: 'Ошибка API ключа.' }, { status: 500 });
    if (error?.status === 429) return Response.json({ error: 'Слишком много запросов. Подождите.' }, { status: 429 });
    return Response.json({ error: 'Ошибка сервера.' }, { status: 500 });
  }
}
