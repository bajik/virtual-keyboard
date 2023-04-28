
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

  #getKeyboardInfo(lang) {
    return fetch(`./lang/${lang}.json`).then((response) => {
      return response.json();
    });
  }

}