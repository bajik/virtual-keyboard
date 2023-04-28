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
    this.#attachEvents();

    this.#state.keyCapsLock = this.#state.container.querySelector(`.keyboard__key[data-code="CapsLock"]`);

    console.log(this.#state);
  }

  #attachEvents() {
    this.#state.container.addEventListener("keydown", this.#handleKeyPressEvent.bind(this, true));
    this.#state.container.addEventListener("keyup", this.#handleKeyPressEvent.bind(this, false));
    window.addEventListener("focus", this.#removeActiveClassFromKeys.bind(this));
  }
  
  #removeActiveClassFromKeys() {
    const keys = this.#state.container.querySelectorAll('.keyboard__key[data-code]:not([data-code="CapsLock"])');
    keys.forEach(key => {
      key.classList.remove('keyboard__key--active');
    });
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

  #handleKeyPressEvent(isActive) {

    this.#updateModifierKeys(event.altKey, event.ctrlKey, event.shiftKey);

    if (event.code === "AltLeft" || event.code === "AltRight") {
      event.preventDefault();
    }
  
    if (event.code === "CapsLock") {
      this.#checkCapsLockOnKeyPress(event);
      return;
    }
      
    const key = this.#state.container.querySelector(`.keyboard__key[data-code="${event.code}"]`);  
    if (!key) return; 
  
    if (isActive) {
      if (!key.classList.contains('keyboard__key--active')) {
        key.classList.add('keyboard__key--active');    
      }
    } else {
      key.classList.remove('keyboard__key--active');
    }
  }

  #checkCapsLockOnKeyPress(event) { 
    const isCapsLockActive = event.getModifierState('CapsLock');
    const keyCapsLock = this.#state.keyCapsLock;
    
    if (isCapsLockActive !== this.#state.isCapsLockActive) {
      this.#state.isCapsLockActive = isCapsLockActive;
      
      if (isCapsLockActive) {
        keyCapsLock.classList.add('keyboard__key--active');
      } else {
        keyCapsLock.classList.remove('keyboard__key--active');
      }

      this.#updateLevelKeyboard();
    }
  }

  #updateModifierKeys(altKey, ctrlKey, shiftKey) {
    let isChange = false;
    
    if (this.#state.altKey !== altKey) {
      this.#state.altKey = altKey;
      isChange = true;
    }
    if (this.#state.ctrlKey !== ctrlKey) {
      this.#state.ctrlKey = ctrlKey;
      isChange = true;
    }
    if (this.#state.shiftKey !== shiftKey) {
      this.#state.shiftKey = shiftKey;
      isChange = true;
    }
    if (isChange) {
      this.#updateLevelKeyboard();
    }     
  }

  #updateLevelKeyboard() {
    let newLevelKey = 1;
  
    if (this.#state.altKey && this.#state.ctrlKey) {
      newLevelKey = this.#state.shiftKey ? 4 : 3;
    } else if (this.#state.shiftKey  && !this.#state.isCapsLockActive || !this.#state.shiftKey  && this.#state.isCapsLockActive) {
      newLevelKey = 2
    }

    if (this.#state.levelKey !== newLevelKey) {
      console.log(newLevelKey);
      this.#state.levelKey = newLevelKey;
      this.#updateKeyboardKeysText();
    }    
  }

  #updateKeyboardKeysText() {
    const elKeys = this.#state.container.querySelectorAll('.keyboard__key'); 

    for (let i = 0; i < elKeys.length; i++) {
      const searchCode = elKeys[i].dataset.code;

      const findElement = this.#state.keybordInfo.keys.find(key => key.code === searchCode);

      if (!findElement.level_1) continue;
      
      if (findElement[`level_${this.#state.levelKey}`]) {
        elKeys[i].textContent = findElement[`level_${this.#state.levelKey}`];
      } else {
        elKeys[i].textContent = "";
      }
    }
  }
}