import {
  createElementWithAttributes, getKeyboardInfo, renderMonitor, createKeyButton, createKeyboardRow,
} from './utils.js';
import ModifierButton from './modifier-button.js';

export default class Keyboard {
  #state = {};

  #listLanguages = ['en', 'ua-unicode'];

  currentIndex = 0;

  constructor(container) {
    const langIndex = localStorage.getItem('lang');
    if (langIndex) {
      this.currentIndex = langIndex;
    }
    getKeyboardInfo(this.#listLanguages[this.currentIndex]).then((keyboardInfo) => {
      this.#state = {
        container,
        keyboardInfo,
        modifierKeys: [
          'ControlLeft', 'ControlRight',
          'AltLeft', 'AltRight',
          'ShiftLeft', 'ShiftRight',
        ],
        arrowsKeys: [
          'ArrowLeft', 'ArrowRight',
          'ArrowDown', 'ArrowUp',
        ],
      };
      this.#init();
    });
  }

  #init() {
    this.#state.altButton = new ModifierButton(this.#state.container, ['AltLeft', 'AltRight']);
    this.#state.controlButton = new ModifierButton(this.#state.container, ['ControlLeft', 'ControlRight']);
    this.#state.shiftButton = new ModifierButton(this.#state.container, ['ShiftLeft', 'ShiftRight']);
    this.#state.capsLockButton = new ModifierButton(this.#state.container, ['CapsLock']);

    localStorage.setItem('lang', this.currentIndex);
    this.#renderComp();
    this.#state.winEditor = this.#state.container.querySelector('#win_editor');
    this.#state.winEditor.focus();
    this.#state.winEditor.selectionStart = 0;
    this.#attachEvents();

    this.#state.keyCapsLock = this.#state.container.querySelector('.keyboard__key[data-code="CapsLock"]');
    this.#updateLevelKeyboard();
  }

  #attachEvents() {
    this.#state.container.addEventListener('keydown', this.#handleKeyPressEvent.bind(this, true));
    this.#state.container.addEventListener('keyup', this.#handleKeyPressEvent.bind(this, false));
    window.addEventListener('focus', this.#removeActiveClassFromKeys.bind(this));
    this.#attachKeyboardEvents();
  }

  #attachKeyboardEvents() {
    const keys = this.#state.container.querySelectorAll('.keyboard__key');
    keys.forEach((key) => {
      key.addEventListener('mousedown', this.#handleKeyMouseDown.bind(this));
      key.addEventListener('mouseup', this.#handleKeyMouseUp.bind(this));
    });
  }

  #handleKeyMouseDown(event) {
    const key = event.target;
    const keyCode = key.dataset.code;
    if (keyCode === 'CapsLock') {
      this.#state.capsLockButton.isActive = !this.#state.capsLockButton.isActive;
      this.#updateLevelKeyboard();
    } else if (this.#state.arrowsKeys.includes(keyCode)) {
      if (!key.classList.contains('keyboard__key--active')) {
        key.classList.add('keyboard__key--active');

        if (keyCode === 'ArrowLeft') {
          this.#state.winEditor.selectionStart -= 1;
          this.#state.winEditor.selectionEnd -= 1;
        } else if (keyCode === 'ArrowRight') {
          this.#state.winEditor.selectionEnd += 1;
          this.#state.winEditor.selectionStart += 1;
        } else if (keyCode === 'ArrowUp') {
          const currentPosition = this.#state.winEditor.selectionStart;
          const currentRow = this.#state.winEditor.value.substr(0, currentPosition).split('\n').length - 1;
          if (currentRow === 0) {
            return;
          }
          const previousRowEndPosition = this.#state.winEditor.value.lastIndexOf('\n', currentPosition - 2) + 1;
          const previousRowStartPosition = this.#state.winEditor.value.lastIndexOf('\n', previousRowEndPosition - 2) + 1;
          const previousRowLength = currentPosition - previousRowEndPosition;
          const newPosition = previousRowStartPosition
              + Math.min(previousRowEndPosition - previousRowStartPosition - 1, previousRowLength);

          this.#state.winEditor.focus();
          this.#state.winEditor.setSelectionRange(newPosition, newPosition);
        } else if (keyCode === 'ArrowDown') {
          const currentPosition = this.#state.winEditor.selectionStart;
          const currentRow = this.#state.winEditor.value.substr(0, currentPosition).split('\n').length - 1;
          const lines = this.#state.winEditor.value.split('\n');
          if (lines.length === 1) return;

          const currentRowLength = lines[currentRow].length;
          const rowsMax = lines.length;

          const previousRowEndPosition = this.#state.winEditor.value.lastIndexOf('\n', currentPosition - 1) + 1;
          const positionInRow = currentPosition - previousRowEndPosition;

          if (currentRow === rowsMax) {
            return;
          }
          const nextRowStartPosition = previousRowEndPosition + currentRowLength + 1;
          const nextRowLength = lines[currentRow + 1].length;
          const newPosition = Math.min(nextRowStartPosition
            + positionInRow, nextRowStartPosition + nextRowLength);
          this.#state.winEditor.focus();
          this.#state.winEditor.setSelectionRange(newPosition, newPosition);
        }
      }
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
        default:
          break;
      }
    } else if (!key.classList.contains('keyboard__key--active')) {
      key.classList.add('keyboard__key--active');
      const searchCode = keyCode;
      const findElement = this.#state.keyboardInfo.keys.find((val) => val.code === searchCode);

      const pos = this.#state.winEditor.selectionStart;
      const text = this.#state.winEditor.value;
      let symbol;
      let posShift = 1;
      let postShift = 0;
      if (keyCode === 'Tab') {
        symbol = '    ';
        posShift = 4;
      } else if (keyCode === 'Enter') {
        symbol = '\n';
      } else if (keyCode === 'Space') {
        symbol = ' ';
      } else if (keyCode === 'Backspace') {
        symbol = '';
        posShift = -1;
      } else if (keyCode === 'Delete') {
        symbol = '';
        posShift = 0;
        postShift = 1;
      } else if (findElement[`level_${this.#state.levelKey}`]) {
        symbol = findElement[`level_${this.#state.levelKey}`];
      } else {
        return;
      }
      const newText = text.substring(0, pos + (posShift < 0 ? posShift : 0))
        + symbol + text.substring(pos + (postShift > 0 ? postShift : 0));
      this.#state.winEditor.value = newText;
      this.#state.winEditor.selectionStart = pos + posShift;
      this.#state.winEditor.selectionEnd = pos + posShift;
      this.#state.winEditor.focus();
      if (this.#state.altButton.isActive || this.#state.shiftButton.isActive
          || this.#state.controlButton.isActive) {
        this.#resetModifierKeys();
        this.#updateLevelKeyboard();
      }
    }
  }

  #resetModifierKeys() {
    this.#state.altButton.isActive = false;
    this.#state.controlButton.isActive = false;
    this.#state.shiftButton.isActive = false;
  }

  #handleKeyMouseUp(event) {
    const key = event.target;
    const keyCode = key.dataset.code;

    if (keyCode === 'CapsLock') return;

    if (this.#state.modifierKeys.includes(keyCode)) {
      this.#checkKeyboardLanguageToggle(event.shiftKey, event.altKey, true);
      this.#updateLevelKeyboard();
      return;
    }

    key.classList.remove('keyboard__key--active');
    this.#state.winEditor.focus();
  }

  #removeActiveClassFromKeys() {
    const keys = this.#state.container.querySelectorAll('.keyboard__key[data-code]:not([data-code="CapsLock"])');
    keys.forEach((key) => {
      key.classList.remove('keyboard__key--active');
    });
    this.#resetModifierKeys();
  }

  #renderComp() {
    const elComp = createElementWithAttributes('div', 'comp');

    elComp.appendChild(renderMonitor());
    elComp.appendChild(this.#renderKeyboard());

    this.#state.container.appendChild(elComp);
  }

  #renderKeyboard() {
    const elKeyboard = createElementWithAttributes('div', 'keyboard');
    this.#sortKeys();
    let currentRow = 0;
    let elRowKeys;

    this.#state.keyboardInfo.keys.forEach((btn) => {
      if (currentRow !== btn.row) {
        if (currentRow > 0) {
          elKeyboard.appendChild(elRowKeys);
        }
        currentRow = btn.row;
        elRowKeys = createKeyboardRow(btn);
      } else {
        const elKey = createKeyButton(btn);
        elRowKeys.appendChild(elKey);
      }
    });

    if (currentRow > 0) {
      elKeyboard.appendChild(elRowKeys);
    }
    return elKeyboard;
  }

  #sortKeys() {
    this.#state.keyboardInfo.keys.sort((a, b) => {
      if (a.row === b.row) {
        return a.pos - b.pos;
      }
      return a.row - b.row;
    });
  }

  #handleKeyPressEvent(isActive, event) {
    this.#state.winEditor.focus();
    const keyCode = event.code;
    if (this.#state.modifierKeys.includes(keyCode)) {
      this.#checkKeyboardLanguageToggle(event.shiftKey, event.altKey);
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
        default:
          break;
      }
      this.#updateLevelKeyboard();
    } else if (keyCode === 'Tab' && isActive) {
      event.preventDefault();

      const pos = this.#state.winEditor.selectionStart;
      const text = this.#state.winEditor.value;
      const posShift = 4;
      const symbol = '    ';
      const newText = text.substring(0, pos) + symbol + text.substring(pos);
      this.#state.winEditor.value = newText;
      this.#state.winEditor.selectionStart = pos + posShift;
      this.#state.winEditor.selectionEnd = pos + posShift;
      this.#state.winEditor.focus();
    } else {
      this.#checkCapsLockOnKeyPress(event);
      if (keyCode === 'CapsLock') return;

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
    const isCapsLockActive = event.getModifierState('CapsLock');
    if (this.#state.capsLockButton.isActive !== isCapsLockActive) {
      this.#state.capsLockButton.isActive = isCapsLockActive;
      this.#updateLevelKeyboard();
    }
  }

  #checkKeyboardLanguageToggle(isShiftKeyActive, isAltKeyActive, isMouse) {
    if (this.#state.altButton.isActive && this.#state.shiftButton.isActive
       && !this.#state.controlButton.isActive && !(isShiftKeyActive && isAltKeyActive)) {
      this.#KeyboardLanguageToggle();
      if (isMouse) {
        this.#resetModifierKeys();
      }
    }
  }

  #KeyboardLanguageToggle() {
    this.currentIndex = (this.currentIndex + 1) % this.#listLanguages.length;
    localStorage.setItem('lang', this.currentIndex);
    getKeyboardInfo(this.#listLanguages[this.currentIndex]).then((keyboardInfo) => {
      this.#state.keyboardInfo = keyboardInfo;
      this.#updateKeyboardKeysText();
    });
  }

  #updateLevelKeyboard() {
    let newLevelKey = 1;

    if (this.#state.altButton.isActive && this.#state.controlButton.isActive
        && this.#state.keyboardInfo.maxLevel > 2) {
      newLevelKey = this.#state.shiftButton.isActive ? 4 : 3;
    } else if ((this.#state.shiftButton.isActive && !this.#state.capsLockButton.isActive)
              || (!this.#state.shiftButton.isActive && this.#state.capsLockButton.isActive)) {
      newLevelKey = 2;
    }

    if (this.#state.levelKey !== newLevelKey) {
      this.#state.levelKey = newLevelKey;
      this.#updateKeyboardKeysText();
    }
  }

  #updateKeyboardKeysText() {
    const elKeys = this.#state.container.querySelectorAll('.keyboard__key');
    elKeys.forEach((elKey) => {
      const searchCode = elKey.dataset.code;
      const findElement = this.#state.keyboardInfo.keys.find((key) => key.code === searchCode);

      if (!findElement.level_1) return;

      if (this.#state.levelKey === 2 && this.#state.capsLockButton.isActive
          && findElement.row === 1) {
        elKey.textContent = findElement.level_1 || '';
      } else {
        elKey.textContent = findElement[`level_${this.#state.levelKey}`] || '';
      }
    });
  }
}
