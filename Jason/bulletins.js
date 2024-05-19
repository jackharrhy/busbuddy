import jsdom from "jsdom";
const { JSDOM } = jsdom;

const data = await fetch('https://www.metrobus.com/bulletins/bulletins.asp')
const html = await data.text();

const dom = new JSDOM(html);

const document = dom.window.document;

const activeLinks = document.querySelectorAll('a.list-group-item.active');

if (activeLinks.length >= 2) {
  // Get the first and second active <a> elements
  const firstActiveLink = activeLinks[0];
  const secondActiveLink = activeLinks[1];

  // Get all sibling elements between the first and second active <a> elements
  let currentElement = firstActiveLink.nextElementSibling;
  const spans = [];

  while (currentElement && currentElement !== secondActiveLink) {
    if (currentElement.tagName.toLowerCase() === 'span' && currentElement.classList.contains('list-group-item')) {
      spans.push(currentElement);
    }
    currentElement = currentElement.nextElementSibling;
  }

  // Print the text content of the collected spans
  spans.forEach(span => {
    console.log(span.textContent);
  });
} else {
  console.log('Not enough active <a> elements found.');
}