import * as utils from './utils.js';

export class Keyboard {

  #state

  constructor(container) {
    console.log('init', container);

    this.#getKeyboardInfo('en').then((keyboardInfo) => {
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
    this.#renderComp();
    this.#state.winEditor = this.#state.container.querySelector('#win_editor');
    this.#attachEvents();

    this.#state.keyCapsLock = this.#state.container.querySelector(`.keyboard__key[data-code="CapsLock"]`);
    this.#updateLevelKeyboard();
    console.log(this.#state);
  }

  #attachEvents() {
    this.#state.container.addEventListener("keydown", this.#handleKeyPressEvent.bind(this, true));
    this.#state.container.addEventListener("keyup", this.#handleKeyPressEvent.bind(this, false));
    window.addEventListener("focus", this.#removeActiveClassFromKeys.bind(this));

    const keys = this.#state.container.querySelectorAll('.keyboard__key');
    keys.forEach(key => {
      key.addEventListener('mousedown', this.#handleKeyMouseDown.bind(this));
      key.addEventListener('mouseup', this.#handleKeyMouseUp.bind(this));
    });

    this.#state.winEditor.addEventListener('input', function() {
      console.log(this.selectionStart);
    });
    this.#state.winEditor.addEventListener('selectionchange', function() {
      console.log(this.selectionStart);
    });
  }

  #handleKeyMouseDown(event) {
    const key = event.target;
    const keyCode = key.dataset.code;

    if (this.#state.modifierKeys.includes(keyCode) || keyCode === 'CapsLock') {
      key.classList.toggle('keyboard__key--active');

      switch (keyCode) {
        case 'ControlLeft':
        case 'ControlRight':
          this.#state.isCtrlKeyActive = !this.#state.isCtrlKeyActive;
          break;
        case 'AltLeft':
        case 'AltRight':
          this.#state.isAltKeyActive = !this.#state.isAltKeyActive;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.#state.isShiftKeyActive = !this.#state.isShiftKeyActive;
          break;
        case 'CapsLock':
          this.#state.isCapsLockActive = !this.#state.isCapsLockActive;
          break;
      }
      this.#updateLevelKeyboard();
    } else {
      if (!key.classList.contains('keyboard__key--active')) {
        key.classList.add('keyboard__key--active');
        const searchCode = key.dataset.code;
        const findElement = this.#state.keyboardInfo.keys.find(key => key.code === searchCode);
        console.log(findElement);
        console.log(this.#state.levelKey);
        if (findElement[`level_${this.#state.levelKey}`]) {
          this.#state.winEditor.textContent += findElement[`level_${this.#state.levelKey}`];
          console.log(this.#state.winEditor.clientWidth);
        }
      }
    }
  }

  #resetModifierKeys() {

  }

  #handleKeyMouseUp(event) {
    const key = event.target;
    const keyCode = key.dataset.code;

    if (this.#state.modifierKeys.includes(keyCode) || keyCode === 'CapsLock') return;

    key.classList.remove('keyboard__key--active');
    this.#state.winEditor.focus();
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
    this.#state.keyboardInfo.keys.sort((a, b) => {
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
    const keyCode = event.code;

    if (this.#state.modifierKeys.includes(keyCode) || this.#state.arrowsKeys.includes(keyCode)) {
      event.preventDefault();
      if (this.#state.arrowsKeys.includes(keyCode) && isActive) {
        console.log('arrowsKeys');
        const findElement = this.#state.keyboardInfo.keys.find(key => key.code === keyCode);
        this.#state.winEditor.textContent += findElement[`title`];
      }
    }

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

  #updateModifierKeys(isAltKeyActive, isCtrlKeyActive, isShiftKeyActive) {
    let isChange = false;

    if (this.#state.isAltKeyActive !== isAltKeyActive) {
      this.#state.isAltKeyActive = isAltKeyActive;
      isChange = true;
    }
    if (this.#state.isCtrlKeyActive !== isCtrlKeyActive) {
      this.#state.isCtrlKeyActive = isCtrlKeyActive;
      isChange = true;
    }
    if (this.#state.isShiftKeyActive !== isShiftKeyActive) {
      this.#state.isShiftKeyActive = isShiftKeyActive;
      isChange = true;
    }
    if (isChange) {
      this.#updateLevelKeyboard();
    }
  }

  #updateLevelKeyboard() {
    let newLevelKey = 1;

    if (this.#state.isAltKeyActive && this.#state.isCtrlKeyActive && this.#state.keyboardInfo.max_level > 2) {
      newLevelKey = this.#state.isShiftKeyActive ? 4 : 3;
    } else if (this.#state.isShiftKeyActive  && !this.#state.isCapsLockActive || !this.#state.isShiftKeyActive  && this.#state.isCapsLockActive) {
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
    for (const elKey of elKeys) {
      const searchCode = elKey.dataset.code;
      const findElement = this.#state.keyboardInfo.keys.find(key => key.code === searchCode);
      if (!findElement.level_1) continue;

      if (this.#state.levelKey === 2 && this.#state.isCapsLockActive && findElement.row === 1) {
        elKey.textContent = findElement.level_1 || "";
      } else {
        elKey.textContent = findElement[`level_${this.#state.levelKey}`] || "";
      }
    }
  }
}