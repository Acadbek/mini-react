// 🔧 createElement: JSX sintaksisini virtual DOM obyektiga aylantiradi
function createElement(type, props = {}, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

// 🔧 createTextElement: Oddiy matn node uchun TEXT_ELEMENT obyektini yaratadi
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 🔧 render: Virtual DOM’ni haqiqiy DOM’ga aylantiradi
function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  // 🔹 Atributlarni qo'shish
  Object.keys(element.props)
    .filter(key => key !== 'children')
    .forEach(name => {
      setAttribute(dom, name, element.props[name]);
    });

  // 🔹 Childlarni rekursiv tarzda render qilish
  element.props.children.forEach(child => render(child, dom));

  // 🔹 DOM'ga qo‘shish
  container.appendChild(dom);
}

// 🔧 setAttribute: Atributlarni DOM elementiga qo‘shadi
function setAttribute(dom, key, value) {
  if (key === 'class') {
    dom.className = value;
  } else if (key.startsWith('on')) {
    const eventType = key.toLowerCase().substring(2);
    dom.addEventListener(eventType, value);
  } else {
    dom[key] = value;
  }
}

// 🔧 diff: Eski va yangi virtual DOM'ni taqqoslaydi va farqlarni qaytaradi
function diff(oldNode, newNode) {
  if (!oldNode) return newNode; // Agar eski node bo‘lmasa, yangi nodeni qo‘shish kerak
  if (!newNode) return null; // Agar yangi node bo‘lmasa, eski nodeni o‘chirish kerak

  // Agar nodelar turlari boshqacha bo‘lsa, eski nodeni almashtiramiz
  if (oldNode.type !== newNode.type) return newNode;

  // 🔹 Props farqlarini topish
  const updatedProps = {};
  const allProps = { ...oldNode.props, ...newNode.props };

  for (const key in allProps) {
    if (oldNode.props[key] !== newNode.props[key]) {
      updatedProps[key] = newNode.props[key];
    }
  }

  // 🔹 Farqni qaytarish
  return {
    ...newNode,
    props: { ...updatedProps },
  };
}

// 🔧 updateElement: DOM’da faqat o‘zgargan qismlarni yangilaydi
function updateElement(container, oldNode, newNode) {
  const patch = diff(oldNode, newNode);

  if (!patch) {
    container.innerHTML = ''; // nodeni o‘chirish
    return;
  }

  if (patch !== oldNode) {
    container.innerHTML = ''; // nodeni almashtirish
    render(patch, container);
  }
}

// 📌 Virtual DOM yaratamiz
const element1 = createElement(
  'div',
  null,
  createElement('h1', { class: 'myDiv' }, 'Salom!'),
  createElement('p', null, 'Bu mening birinchi React klonim.')
);

// 📌 DOM’ga birinchi marta render qilish
const container = document.getElementById('root');
render(element1, container);

const element2 = createElement(
  'div',
  null,
  createElement('h1', { class: 'myDiv' }, 'Salom, dunyo!'),
  createElement('p', null, 'Bu yangilangan React klonim.')
);

// DOM faqat o‘zgargan qismi yangilanadi
setTimeout(() => {
  updateElement(container, element1, element2);
}, 3000);
