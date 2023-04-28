
export function createElementWithAttributes(tag, clasNames, attributes) {
  if (typeof(tag) !== 'string') return undefined;
  const elem = document.createElement(tag);
  
  if (clasNames) {
    elem.classList.add(...clasNames.split(' '));
  }
  if (attributes) {
    for (const attr in attributes) {
      elem.setAttribute(attr, attributes[attr]);
    }
  }
  return elem;
}
 