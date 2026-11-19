const form = document.querySelector('#ask-form');
const input = document.querySelector('#question');
const button = document.querySelector('#ask-button');
const notice = document.querySelector('#notice');
const cards = new Map([...document.querySelectorAll('.answer-card[data-model]')].map(card => [card.dataset.model, card]));

function setCard(id, state, text, model) {
  const card = cards.get(id);
  if (!card) return;
  const badge = card.querySelector('.state');
  const body = card.querySelector('.answer-body');
  badge.className = `state ${state}`;
  badge.textContent = state === 'loading' ? 'YANITLIYOR' : state === 'done' ? 'TAMAMLANDI' : state === 'error' ? 'HATA' : 'BEKLİYOR';
  body.className = `answer-body ${state === 'error' ? 'error-copy' : state === 'loading' ? 'loading-copy' : ''}`;
  body.textContent = text;
  if (model) card.querySelector('.card-head p').textContent = model;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) { notice.textContent = 'Önce bir soru yaz.'; input.focus(); return; }
  notice.textContent = '';
  button.disabled = true;
  button.querySelector('span:first-child').textContent = 'Gemini yanıtlıyor';
  setCard('gemini', 'loading', 'Gemini yanıtı hazırlanıyor…');
  try {
    const response = await fetch('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'İstek gönderilemedi.');
    for (const result of data.results) {
      setCard(result.id, result.error ? 'error' : 'done', result.error || result.answer, result.model);
    }
    if (data.results.every(result => result.error)) notice.textContent = 'Gemini yanıt veremedi. API anahtarını ve model ayarını kontrol et.';
  } catch (error) {
    notice.textContent = error.message || 'Sunucuya bağlanılamadı. Uygulamanın çalıştığını kontrol et.';
    setCard('gemini', 'error', 'Sunucuya erişilemedi.');
  } finally {
    button.disabled = false;
    button.querySelector('span:first-child').textContent = "Gemini'ye sor";
  }
});

