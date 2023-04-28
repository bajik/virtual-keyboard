
import * as utils from './utils.js';

export class Keyboard {
  
  #state

  constructor(container) {
    console.log('init', container);
    this.#state = {
      container: container
    };
  
    this.#init();    
  };

  #init() {
    const elComp = utils.createElementWithAttributes('div', 'comp');     
    elComp.appendChild(this.#getMonitor());
    this.#state.container.appendChild(elComp);
  }

  #getMonitor() {
    const elMonitor = utils.createElementWithAttributes('div', 'monitor');
    const elMonitorScreen = utils.createElementWithAttributes('div', 'monitor__screen');
    const elWinEditor = utils.createElementWithAttributes('textarea', 'win_editor', { id: 'win_editor'});

    elMonitorScreen.appendChild(elWinEditor);
    elMonitor.appendChild(elMonitorScreen);
    return elMonitor;
  }  
}