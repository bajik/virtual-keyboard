
import * as utils from './utils.js';

export class Keyboard {
  
  #state

  constructor(container) {
    console.log('init', container);

    this.#getKeyboardInfo('ua-unicode').then((keybordInfo) => {
      this.#state = {
        container: container, 
        keybordInfo: keybordInfo
      };
  
      this.#init();
    });
  };

  #init() {
    this.#renderComp();
    console.log(this.#state);
  }

  #renderComp() {
    const elComp = utils.createElementWithAttributes('div', 'comp');     
    elComp.appendChild(this.#renderMonitor());
    elComp.appendChild(this.#renderKeyboard());
    
    this.#state.container.appendChild(elComp);
  }

  #renderMonitor() {
    const elMonitor = utils.createElementWithAttributes('div', 'monitor');
    const elMonitorScreen = utils.createElementWithAttributes('div', 'monitor__screen');
    const elWinEditor = utils.createElementWithAttributes('textarea', 'win_editor', { id: 'win_editor'});

    elMonitorScreen.appendChild(elWinEditor);
    elMonitor.appendChild(elMonitorScreen);
    return elMonitor;
  }

  #renderKeyboard() {
    const elKeyboard = utils.createElementWithAttributes('div', 'keyboard');
      
    this.#sortKeys();
    
    let curentRow = 0;
    let elRowKeys;

    this.#state.keybordInfo.keys.forEach(btn => {           
      if (curentRow !== btn.row) {
        if (curentRow > 0) {
          elKeyboard.appendChild(elRowKeys);
        }
        curentRow = btn.row;
        elRowKeys = this.#createKeyboardRow(btn);
      } else {
        const elKey = this.#createKeyButton(btn);
        elRowKeys.appendChild(elKey);
      }
    });

    if (curentRow > 0) {
      elKeyboard.appendChild(elRowKeys);
    }   
    return elKeyboard;
  }

  #createKeyButton(btn) {
    const elKey = utils.createElementWithAttributes('button', 'keyboard__key', {'data-code': btn.code})
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

  #createKeyboardRow(btn) {
    const elRowKeys = utils.createElementWithAttributes('div', 'keyboard__row');
    const elKey = this.#createKeyButton(btn);
    elRowKeys.appendChild(elKey);
    return elRowKeys;
  }

  #sortKeys() {
    this.#state.keybordInfo.keys.sort((a, b) => {
      if (a.row === b.row) {
        return a.pos - b.pos;
      }
      return a.row - b.row;
    });
  }

  #getKeyboardInfo(lang) {
    return fetch(`./lang/${lang}.json`).then((response) => {
      return response.json();
    });
  }

}