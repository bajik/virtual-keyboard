export function createElementWithAttributes(tag, classNames, attributes) {
  if (typeof (tag) !== 'string') return undefined;
  const elem = document.createElement(tag);

  if (classNames) {
    elem.classList.add(...classNames.split(' '));
  }
  if (attributes) {
    Object.keys(attributes).forEach((attr) => {
      elem.setAttribute(attr, attributes[attr]);
    });
  }
  return elem;
}

export function getKeyboardInfo(lang) {
  return fetch(`./lang/${lang}.json`).then((response) => response.json());
}

export function renderMonitor() {
  const elMonitor = createElementWithAttributes('div', 'monitor');
  const elMonitorScreen = createElementWithAttributes('div', 'monitor__screen');
  const elWinEditor = createElementWithAttributes('textarea', 'win_editor', { id: 'win_editor' });

  elMonitorScreen.appendChild(elWinEditor);
  elMonitor.appendChild(elMonitorScreen);
  return elMonitor;
}

export function createKeyButton(btn) {
  const elKey = createElementWithAttributes('button', 'keyboard__key', { 'data-code': btn.code });
  if (btn.level_1) {
    elKey.textContent = btn.level_1;
  }
  if (btn.title) {
    elKey.textContent = btn.title;
  }
  if (btn.style) {
    elKey.setAttribute('style', btn.style);
  }
  return elKey;
}

export function createKeyboardRow(btn) {
  const elRowKeys = createElementWithAttributes('div', 'keyboard__row');
  const elKey = createKeyButton(btn);
  elRowKeys.appendChild(elKey);
  return elRowKeys;
}
