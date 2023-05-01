import * as utils from './utils.js';

let winEditorPosition = 0;

class ModifierButton {
  constructor(container, code) {
    this._active = false;
    this._container = container;
    this._code = code;
  }
  get isActive() {
    return this._active;
  }
  set isActive(value) {
    this._code.forEach(code => {
      const btn = this._container.querySelector(`.keyboard__key[data-code="${code}"]`);
      if (value) {
        btn.classList.add('keyboard__key--active');
      } else {
        btn.classList.remove('keyboard__key--active');
      }
    });
    this._active = value;
  }
}


export class Keyboard {

  #state

  #listLanguages = ['en', 'ua-unicode'];
  #currentIndex = 0;

  constructor(container) {
    const langIndex = localStorage.getItem('lang');
    if (langIndex) {
      this.#currentIndex = langIndex;
    }
    this.#getKeyboardInfo(this.#listLanguages[this.#currentIndex]).then((keyboardInfo) => {
      this.#state = {
        container: container,
        keyboardInfo: keyboardInfo,
        modifierKeys: [
          'ControlLeft', 'ControlRight',
          'AltLeft', 'AltRight',
          'ShiftLeft', 'ShiftRight'
        ],
        arrowsKeys: [
          'ArrowLeft', 'ArrowRight',
          'ArrowDown', 'ArrowUp'
        ]
      };
      this.#init();
    });
  };

  #init() {
    // console.log('init');
    this.#state.altButton = new ModifierButton(this.#state.container, ['AltLeft', 'AltRight']);
    this.#state.controlButton = new ModifierButton(this.#state.container, ['ControlLeft', 'ControlRight']);
    this.#state.shiftButton = new ModifierButton(this.#state.container, ['ShiftLeft', 'ShiftRight']);
    this.#state.capsLockButton = new ModifierButton(this.#state.container, ['CapsLock']);

    localStorage.setItem ('lang', this.#currentIndex);
    this.#renderComp();
    this.#state.winEditor = this.#state.container.querySelector('#win_editor');
    this.#state.winEditor.focus();
    this.#state.winEditor.selectionStart = 0;
    this.#attachEvents();

    this.#state.keyCapsLock = this.#state.container.querySelector(`.keyboard__key[data-code="CapsLock"]`);
    this.#updateLevelKeyboard();
  }

  #attachEvents() {
    // console.log('attachEvents');
    this.#state.container.addEventListener("keydown", this.#handleKeyPressEvent.bind(this, true));
    this.#state.container.addEventListener("keyup", this.#handleKeyPressEvent.bind(this, false));
    window.addEventListener("focus", this.#removeActiveClassFromKeys.bind(this));

    this.#attachKeyboardEvents();
  }

  #attachKeyboardEvents() {
    // console.log('attachKeyboardEvents');
    const keys = this.#state.container.querySelectorAll('.keyboard__key');
    keys.forEach(key => {
      key.addEventListener('mousedown', this.#handleKeyMouseDown.bind(this));
      key.addEventListener('mouseup', this.#handleKeyMouseUp.bind(this));
    });
  }

  #handleKeyMouseDown(event) {
    // console.log('handleKeyMouseDown');
    const key = event.target;
    const keyCode = key.dataset.code;
    if (keyCode === 'CapsLock') {
      this.#state.capsLockButton.isActive = !this.#state.capsLockButton.isActive;
      this.#updateLevelKeyboard();
    } else if (keyCode === "ArrowLeft") {
      this.#state.winEditor.selectionStart -= 1;
      // this.#state.winEditor.selectionEnd = this.#state.winEditor.selectionStart - 1;
    } else if (this.#state.modifierKeys.includes(keyCode)) {
      switch (keyCode) {
        case 'ControlLeft':
        case 'ControlRight':
          this.#state.controlButton.isActive = !this.#state.controlButton.isActive;
          break;
        case 'AltLeft':
        case 'AltRight':
          this.#state.altButton.isActive = !this.#state.altButton.isActive;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.#state.shiftButton.isActive = !this.#state.shiftButton.isActive;
          break;
      }

      // таймер
      // this.#checkKeyboardLanguageToggle(event.shiftKey, event.altKey, true);
      // this.#updateLevelKeyboard();
    } else {
      if (!key.classList.contains('keyboard__key--active')) {
        key.classList.add('keyboard__key--active');
        const searchCode = keyCode;
        const findElement = this.#state.keyboardInfo.keys.find(key => key.code === searchCode);

        const pos = this.#state.winEditor.selectionStart;
        const text = this.#state.winEditor.value;
        let symbol;
        let posShift = 1;
        
        if (keyCode === "Tab") {
          symbol = "    ";
          posShift = 4;
        } else if (keyCode === "Enter") {
          symbol = "\n"
        } else if (keyCode === "Space") {
          symbol = " "
        } else if (keyCode === "Backspace") {
          symbol = ""
          posShift = -1;
        } else if (keyCode === "Delete") {
          symbol = ""
          posShift = -1;
        } else {
          if (findElement[`level_${this.#state.levelKey}`]) {
            symbol = findElement[`level_${this.#state.levelKey}`];
          } else {
            return;
          }
        }
        // console.log(symbol);
        const newText = text.substring(0, pos + (posShift < 0 ? posShift: 0)) + symbol + text.substring(pos);
        this.#state.winEditor.value = newText;
        this.#state.winEditor.selectionStart = pos + posShift;
        this.#state.winEditor.selectionEnd = pos + posShift;
        this.#state.winEditor.focus();
        if (this.#state.altButton.isActive || this.#state.shiftButton.isActive || this.#state.controlButton.isActive) {
          this.#resetModifierKeys();
          this.#updateLevelKeyboard();
        }
      }
    }
  }

  #resetModifierKeys() {
    // console.log('resetModifierKeys');
    this.#state.altButton.isActive = false;
    this.#state.controlButton.isActive = false;
    this.#state.shiftButton.isActive = false;
  }

  #handleKeyMouseUp(event) {
    // console.log('handleKeyMouseUp');
    const key = event.target;
    const keyCode = key.dataset.code;

    if (keyCode === 'CapsLock') {
      return;    
    } else if (this.#state.modifierKeys.includes(keyCode)) {
      this.#checkKeyboardLanguageToggle(event.shiftKey, event.altKey, true);
      this.#updateLevelKeyboard();
      return;
    } 

    key.classList.remove('keyboard__key--active');
    this.#state.winEditor.focus();
  }


  #removeActiveClassFromKeys() {
    // console.log('removeActiveClassFromKeys');
    const keys = this.#state.container.querySelectorAll('.keyboard__key[data-code]:not([data-code="CapsLock"])');
    keys.forEach(key => {
      key.classList.remove('keyboard__key--active');
    });
    this.#resetModifierKeys();
  }

  #renderComp() {
    // console.log('renderComp');
    const elComp = utils.createElementWithAttributes('div', 'comp');
    elComp.appendChild(this.#renderMonitor());
    elComp.appendChild(this.#renderKeyboard());

    this.#state.container.appendChild(elComp);
  }

  #renderMonitor() {
    // console.log('renderMonitor');
    const elMonitor = utils.createElementWithAttributes('div', 'monitor');
    const elMonitorScreen = utils.createElementWithAttributes('div', 'monitor__screen');
    const elWinEditor = utils.createElementWithAttributes('textarea', 'win_editor', { id: 'win_editor'});

    elMonitorScreen.appendChild(elWinEditor);
    elMonitor.appendChild(elMonitorScreen);
    return elMonitor;
  }

  #renderKeyboard() {
    // console.log('renderKeyboard');
    const elKeyboard = utils.createElementWithAttributes('div', 'keyboard');
    this.#sortKeys();
    let currentRow = 0;
    let elRowKeys;

    this.#state.keyboardInfo.keys.forEach(btn => {
      if (currentRow !== btn.row) {
        if (currentRow > 0) {
          elKeyboard.appendChild(elRowKeys);
        }
        currentRow = btn.row;
        elRowKeys = this.#createKeyboardRow(btn);
      } else {
        const elKey = this.#createKeyButton(btn);
        elRowKeys.appendChild(elKey);
      }
    });

    if (currentRow > 0) {
      elKeyboard.appendChild(elRowKeys);
    }
    return elKeyboard;
  }

  #createKeyButton(btn) {
    // console.log('createKeyButton');
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
    // console.log('createKeyboardRow');
    const elRowKeys = utils.createElementWithAttributes('div', 'keyboard__row');
    const elKey = this.#createKeyButton(btn);
    elRowKeys.appendChild(elKey);
    return elRowKeys;
  }

  #sortKeys() {
    console.log('sortKeys');
    this.#state.keyboardInfo.keys.sort((a, b) => {
      if (a.row === b.row) {
        return a.pos - b.pos;
      }
      return a.row - b.row;
    });
  }

  #getKeyboardInfo(lang) {
    // console.log('getKeyboardInfo');
    return fetch(`./lang/${lang}.json`).then((response) => {
      return response.json();
    });
  }

  #handleKeyPressEvent(isActive) {
    // console.log('handleKeyPressEvent');
    console.log(event);
    this.#state.winEditor.focus();
    const keyCode = event.code;
    if (this.#state.modifierKeys.includes(keyCode)) {
      this.#checkKeyboardLanguageToggle(event.shiftKey, event.altKey);
      console.log(keyCode);
      console.log(this.#state);
      event.preventDefault();
      switch (keyCode) {
        case 'ControlLeft':
        case 'ControlRight':
          this.#state.controlButton.isActive = isActive;
          break;
        case 'AltLeft':
        case 'AltRight':
          this.#state.altButton.isActive = isActive;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.#state.shiftButton.isActive = isActive;
          break;
      }
      this.#updateLevelKeyboard();
    } else {
      this.#checkCapsLockOnKeyPress(event);
      if (keyCode === "CapsLock") return;

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
  }

  #checkCapsLockOnKeyPress(event) {
    // console.log('checkCapsLockOnKeyPress');
    const isCapsLockActive = event.getModifierState('CapsLock');
    if (this.#state.capsLockButton.isActive !== isCapsLockActive) {
      this.#state.capsLockButton.isActive = isCapsLockActive;
      this.#updateLevelKeyboard();
    }
  }

  #checkKeyboardLanguageToggle(isShiftKeyActive, isAltKeyActive, isMouse) {
    // console.log('checkKeyboardLanguageToggle');
    if (this.#state.altButton.isActive && this.#state.shiftButton.isActive &&
       !this.#state.controlButton.isActive && !(isShiftKeyActive && isAltKeyActive)) {
      this.#KeyboardLanguageToggle();
      if (isMouse) {
        this.#resetModifierKeys();
      }
    }
  }

  #KeyboardLanguageToggle() {
    // console.log('KeyboardLanguageToggle');
    this.#currentIndex = (this.#currentIndex + 1) % this.#listLanguages.length;
    localStorage.setItem ('lang', this.#currentIndex);
    // this.#resetModifierKeys();
    this.#getKeyboardInfo(this.#listLanguages[this.#currentIndex]).then((keyboardInfo) => {
      this.#state.keyboardInfo = keyboardInfo;
      this.#updateKeyboardKeysText();
    });
  }

  #updateLevelKeyboard() {
    // console.log('updateLevelKeyboard');
    let newLevelKey = 1;

    if (this.#state.altButton.isActive && this.#state.controlButton.isActive && this.#state.keyboardInfo.max_level > 2) {
      newLevelKey = this.#state.shiftButton.isActive ? 4 : 3;
    } else if (this.#state.shiftButton.isActive && !this.#state.capsLockButton.isActive ||
              !this.#state.shiftButton.isActive && this.#state.capsLockButton.isActive) {
      newLevelKey = 2
    }

    if (this.#state.levelKey !== newLevelKey) {
      this.#state.levelKey = newLevelKey;
      this.#updateKeyboardKeysText();
    }
  }

  #updateKeyboardKeysText() {
    console.log('updateKeyboardKeysText');
    const elKeys = this.#state.container.querySelectorAll('.keyboard__key');
    for (const elKey of elKeys) {
      const searchCode = elKey.dataset.code;
      const findElement = this.#state.keyboardInfo.keys.find(key => key.code === searchCode);
      if (!findElement.level_1) continue;

      if (this.#state.levelKey === 2 && this.#state.capsLockButton.isActive && findElement.row === 1) {
        elKey.textContent = findElement.level_1 || "";
      } else {
        elKey.textContent = findElement[`level_${this.#state.levelKey}`] || "";
      }
    }
  }
}