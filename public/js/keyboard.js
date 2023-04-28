
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
    const elComp = utils.createElementWithAttributes('div', 'comp');     
    elComp.appendChild(this.#getMonitor());
    elComp.appendChild(this.#getKeyboard());
    
    this.#state.container.appendChild(elComp);
    console.log(this.#state);
  }

  #getMonitor() {
    const elMonitor = utils.createElementWithAttributes('div', 'monitor');
    const elMonitorScreen = utils.createElementWithAttributes('div', 'monitor__screen');
    const elWinEditor = utils.createElementWithAttributes('textarea', 'win_editor', { id: 'win_editor'});

    elMonitorScreen.appendChild(elWinEditor);
    elMonitor.appendChild(elMonitorScreen);
    return elMonitor;
  }

  #getKeyboard() {
    const elKeyboard = utils.createElementWithAttributes('div', 'keyboard');
       
    this.#state.keybordInfo.keys.sort((a, b) => {
      if (a.row === b.row) {
        return a.pos - b.pos;
      }
      return a.row - b.row;
    });

    let curentRow = 0;
    let elRowKeys;
    
    this.#state.keybordInfo.keys.forEach(btn => {           
      if (curentRow !== btn.row) {
        if (curentRow > 0) {
          elKeyboard.appendChild(elRowKeys);
        }
        curentRow = btn.row;
        elRowKeys = utils.createElementWithAttributes('div', 'keyboard__row');
      }
      const elKey = utils.createElementWithAttributes('button', 'keyboard__key', {'data-code': btn.code})
      if (btn.level_1) {
        elKey.textContent = btn.level_1;
      }
      if (btn.title) {
        elKey.textContent = btn.title;
      }
      
      if (btn.width) {
        if (btn.width === "grow") {
          elKey.classList.add('keyboard__key--grow');
        } else {
          elKey.setAttribute('style', `width: ${parseFloat(btn.width)}rem`);
        }
      }

      elRowKeys.appendChild(elKey);
    });
    if (curentRow > 0) {
      elKeyboard.appendChild(elRowKeys);
    }
    console.log(elKeyboard);

    return elKeyboard;
  }

  #getKeyboardInfo(lang) {
    return fetch(`./lang/${lang}.json`).then((response) => {
      return response.json();
    });
  }

}