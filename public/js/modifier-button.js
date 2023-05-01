export default class ModifierButton {
  constructor(container, code) {
    this.active = false;
    this.container = container;
    this.code = code;
  }

  get isActive() {
    return this.active;
  }

  set isActive(value) {
    this.code.forEach((code) => {
      const btn = this.container.querySelector(`.keyboard__key[data-code="${code}"]`);
      if (value) {
        btn.classList.add('keyboard__key--active');
      } else {
        btn.classList.remove('keyboard__key--active');
      }
    });
    this.active = value;
  }
}
