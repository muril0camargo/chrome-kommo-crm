/**
 * content.js
 *
 * Este content script roda em páginas do domínio *.kommo.com,
 * varre elementos visíveis da interface e aplica classes CSS em cards
 * conforme palavras-chave encontradas no texto (tags).
 */

(() => {
  const CARD_SELECTORS = [
    '[data-id]',
    '.card',
    '.pipeline-card',
    '.feed-card',
    '.leads-card',
    '.js-card'
  ];

  /**
   * Verifica se um elemento está visível na viewport/layout.
   * @param {Element} el
   * @returns {boolean}
   */
  function isVisible(el) {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      parseFloat(style.opacity || '1') > 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  /**
   * Normaliza texto para comparação case-insensitive e sem acentos.
   * @param {string} text
   * @returns {string}
   */
  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Aplica classes de cor em um card, conforme termos encontrados.
   * @param {Element} card
   */
  function colorizeCard(card) {
    const text = normalize(card.textContent || '');

    card.classList.remove('ktc-urgente', 'ktc-importante');

    if (text.includes('urgente')) {
      card.classList.add('ktc-urgente');
      return;
    }

    if (text.includes('importante')) {
      card.classList.add('ktc-importante');
    }
  }

  /**
   * Procura cards visíveis e aplica as classes de destaque.
   */
  function scanAndColorize() {
    const cards = new Set();

    CARD_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (isVisible(el)) {
          cards.add(el);
        }
      });
    });

    cards.forEach(colorizeCard);
  }

  // Roda no carregamento inicial.
  scanAndColorize();

  // Observa mudanças no DOM (listas que atualizam dinamicamente no Kommo).
  const observer = new MutationObserver(() => {
    // Pequeno debounce via requestAnimationFrame para reduzir repinturas.
    window.requestAnimationFrame(scanAndColorize);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
