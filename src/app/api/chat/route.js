import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Classify if query is about USCIS/immigration or about local places/life
function classifyQuery(query) {
  const q = query.toLowerCase();
  const uscisKeywords = ['uscis', 'форм', 'виза', 'грин', 'карт', 'гражданств', 'натурализ', 'asylum', 'убежищ', 'ead', 'i-', 'n-', 'ds-', 'tps', 'петиц', 'статус', 'кейс', 'receipt', 'иммигра', 'депортац', 'пошлин', 'ssn'];
  const placesKeywords = ['ресторан', 'бар', 'кафе', 'кофе', 'хайк', 'поесть', 'выпить', 'погулять', 'кино', 'музык', 'концерт', 'место', 'район', 'где ', 'куда', 'жильё', 'аренд', 'снять', 'работ', 'вакансий'];

  const uscisScore = uscisKeywords.filter(k => q.includes(k)).length;
  const placesScore = placesKeywords.filter(k => q.includes(k)).length;

  if (uscisScore > placesScore) return 'uscis';
  if (placesScore > uscisScore) return 'places';
  return 'general';
}

// Search user-created places in Supabase
async function searchPlaces(query) {
  const { data } = await supabase
    .from('places')
    .select('*')
    .or(`name.ilike.%${query}%,tip.ilike.%${query}%,address.ilike.%${query}%,district.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(10);
  return data || [];
}

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();

    const queryType = classifyQuery(message);
    let context = '';

    if (queryType === 'places') {
      // Search user-submitted places database
      const places = await searchPlaces(message);
      if (places.length > 0) {
        context = `\n\nДанные из базы мест, добавленных пользователями нашего комьюнити:\n${places.map(p =>
          `- ${p.name} (${p.district}, ${p.category}): ${p.tip} | Адрес: ${p.address} | Рейтинг: ${p.rating} | Добавил: ${p.added_by}`
        ).join('\n')}`;
      } else {
        context = '\n\nВ базе мест комьюнити пока нет подходящих результатов. Скажи пользователю, что наше комьюнити ещё растёт и он может сам добавить место.';
      }
    }

    const systemPrompt = `Ты — AI-помощник приложения "СВОИ в LA" для русскоязычных иммигрантов в Лос-Анджелесе.

ПРАВИЛА:
1. Отвечай ТОЛЬКО на вопросы, связанные с:
   - Иммиграцией, USCIS, визами, грин-картами, гражданством
   - Жизнью в Лос-Анджелесе: места, районы, рестораны, развлечения
   - Аренда жилья, поиск работы в LA
2. Если вопрос НЕ связан с этими темами — вежливо объясни, что ты специализированный помощник и предложи задать релевантный вопрос.
3. Для USCIS вопросов: давай актуальную информацию, указывай номера форм, примерные сроки и пошлины. ВСЕГДА добавляй дисклеймер, что это информационная помощь, не юридическая консультация.
4. Для вопросов о местах: отвечай на основе данных из базы комьюнити (если предоставлены ниже). Упоминай кто добавил место и их совет.
5. Отвечай на русском языке, понятно и по делу. Не будь многословным.
6. НЕ фантазируй. Если не знаешь — скажи что не знаешь.
${context}`;

    const messages = [
      ...history.map(m => ({ role: m.role, content: m.text })),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      ...(queryType === 'uscis' ? {
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
        }],
      } : {}),
    });

    // Extract text from response (may contain web search results)
    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return Response.json({ text, queryType });

  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Ошибка сервера. Попробуйте позже.' },
      { status: 500 }
    );
  }
}
