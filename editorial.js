const heroTitle = document.querySelector('.hero h1');
const heroContent = document.querySelector('.hero-content');

function fitHeroTitle() {
  const style = getComputedStyle(heroContent);
  const available = heroContent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  if (available <= 0) return;
  heroTitle.style.fontSize = '100px';
  const titleWidth = heroTitle.getBoundingClientRect().width;
  const size = Math.min(360, 100 * available / titleWidth);
  heroTitle.style.fontSize = `${size}px`;
  const fittedWidth = heroTitle.getBoundingClientRect().width;
  if (fittedWidth > available) {
    heroTitle.style.fontSize = `${size * (available - 1) / fittedWidth}px`;
  }
}

new ResizeObserver(fitHeroTitle).observe(heroContent.closest('.hero'));
document.fonts.ready.then(fitHeroTitle);
fitHeroTitle();

const header = document.querySelector('.site-header');
const sectionNav = header.querySelector('nav');
const sectionLinks = [...sectionNav.querySelectorAll('a[href^="#"]')].map((link) => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
})).filter(({ section }) => section);
let activeLink;
let sectionUpdate = 0;

function updateActiveSection() {
  sectionUpdate = 0;
  const readingLine = header.getBoundingClientRect().bottom + window.innerHeight * .12;
  const page = document.documentElement;
  const atBottom = window.scrollY > 0 && window.scrollY + page.clientHeight >= page.scrollHeight - 2;
  const nextLink = atBottom
    ? sectionLinks.at(-1)?.link
    : sectionLinks.findLast(({ section }) => section.getBoundingClientRect().top <= readingLine)?.link;
  if (nextLink !== activeLink) {
    activeLink?.removeAttribute('aria-current');
    nextLink?.setAttribute('aria-current', 'location');
    activeLink = nextLink;
    sectionNav.style.setProperty('--underline-opacity', nextLink ? '1' : '0');
  }
  if (nextLink) {
    const rect = nextLink.getBoundingClientRect();
    sectionNav.style.setProperty('--underline-x', `${rect.left - sectionNav.getBoundingClientRect().left}px`);
    sectionNav.style.setProperty('--underline-width', `${rect.width}px`);
  }
}

function scheduleSectionUpdate() {
  if (!sectionUpdate) sectionUpdate = requestAnimationFrame(updateActiveSection);
}

window.addEventListener('scroll', scheduleSectionUpdate, { passive: true });
window.addEventListener('resize', scheduleSectionUpdate);
window.addEventListener('pageshow', scheduleSectionUpdate);
const sectionResize = new ResizeObserver(scheduleSectionUpdate);
sectionResize.observe(header);
sectionResize.observe(sectionNav);
for (const { section } of sectionLinks) sectionResize.observe(section);
document.fonts.ready.then(scheduleSectionUpdate);
scheduleSectionUpdate();

for (const story of document.querySelectorAll('[data-story]')) {
  const panels = [...story.children];
  const tabs = document.createElement('div');
  tabs.className = 'story-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-labelledby', story.getAttribute('aria-labelledby'));

  const buttons = panels.map((panel) => {
    const heading = panel.querySelector('h4');
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.textContent = heading.textContent;
    tab.id = `${panel.id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    heading.hidden = true;
    tabs.append(tab);
    return tab;
  });

  function select(index, focus = false) {
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) buttons[index].focus();
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', (event) => {
      let next;
      switch (event.key) {
        case 'ArrowLeft': next = (index + buttons.length - 1) % buttons.length; break;
        case 'ArrowRight': next = (index + 1) % buttons.length; break;
        case 'Home': next = 0; break;
        case 'End': next = buttons.length - 1; break;
        default: return;
      }
      event.preventDefault();
      select(next, true);
    });
  });

  select(0);
  story.prepend(tabs);
}
