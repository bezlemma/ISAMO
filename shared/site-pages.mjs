import resources from '../data/chicken-resources.json' with { type: 'json' };
import trustees from '../data/committee.json' with { type: 'json' };
import series from '../data/event-series.json' with { type: 'json' };

const text = (key, label, max = 200, optional = false) => ({ key, label, type: 'text', max, optional });
const paragraph = (key, label) => ({ ...text(key, label, 10000), type: 'textarea' });
const link = (key, label, optional = false) => ({ ...text(key, label, 2000, optional), type: 'url' });
const people = [text('name', 'Name'), text('role', 'Role', 200, true), text('institution', 'Institution'), link('website', 'Website', true), { ...text('email', 'Email', 254, true), type: 'email' }, { ...text('avatar', 'Photo', 100, true), type: 'select', options: ['', 'Ruth.png', 'Michael.png', 'gunes.avif', 'bezia.png', 'Melanie.png'] }];
export const pageDefinitions = {
  about: { label: 'What is ISAMO?', fields: [text('title', 'Page title'), text('missionTitle', 'Section heading'), paragraph('mission', 'Mission statement')] },
  events: { label: 'Events', fields: [text('title', 'Page title'), { key: 'series', label: 'Event series', type: 'list', fixed: true, max: 3, fields: [text('id', 'Series', 20), text('name', 'Name'), paragraph('description', 'Description'), link('url', 'Website'), text('linkLabel', 'Link text')] }] },
  resources: { label: 'Resources', fields: [text('title', 'Page title'), { key: 'resources', label: 'Resources', singular: 'resource', type: 'list', max: 100, fields: [text('name', 'Name'), text('category', 'Category'), paragraph('description', 'Description'), link('url', 'Website'), text('location', 'Location', 200, true)] }] },
  'who-we-are': { label: 'Who are we?', fields: [text('title', 'Page title'), text('trusteesTitle', 'Trustees heading'), paragraph('trusteesDescription', 'Trustees introduction'), { key: 'trustees', label: 'Trustees', singular: 'trustee', type: 'list', max: 50, fields: people }, text('boardTitle', 'Advisory board heading'), paragraph('boardDescription', 'Advisory board introduction'), { key: 'board', label: 'Scientific Advisory Board', singular: 'board member', type: 'list', max: 50, fields: [text('name', 'Name'), text('institution', 'Institution')] }, text('contactTitle', 'Contact heading'), paragraph('contactDescription', 'Contact introduction'), { ...text('email', 'Contact email', 254), type: 'email' }] }
};

export const pageDefaults = {
  about: { title: 'What is ISAMO?', missionTitle: 'Our mission', mission: 'Through promoting open scientific exchange and interdisciplinary collaboration, the International Society for Avian Model Organisms (ISAMO) supports innovation and the generation of new knowledge about avian model systems that has potential broader societal and scientific impact. Research using avian models provides critical insight into the mechanisms underlying development, health, and disease.\n\nISAMO seeks to promote the use of avian model organisms globally, including the chicken, quail, songbirds and ducks, which offer unique advantages due to their experimental accessibility, versatility, and evolutionary position among vertebrates. This work contributes directly to biomedical research, including disease modelling and translational medicine, and interfaces closely with related disciplines such as molecular and cellular biology, genetics, immunology, neuroscience, and behavioural science.' },
  events: { title: 'Events', series },
  resources: { title: 'Scientific Resources', resources },
  'who-we-are': { title: 'Who are we?', trusteesTitle: 'Trustees', trusteesDescription: 'Our trustees oversee the society’s activities, membership and finances.', trustees, boardTitle: 'Scientific Advisory Board', boardDescription: 'The board advises the trustees on the society’s scientific activities.', board: [{ name: 'Susanne Dietrich', institution: 'University of Portsmouth' }], contactTitle: 'Contact us', contactDescription: 'For membership, events and society enquiries, email:', email: 'admin@avianmodel.org' }
};

export function validatePage(page, content) {
  if (!Object.hasOwn(pageDefinitions, page)) throw new Error('Page not found.');
  function validate(fields, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Enter the page content.');
    const result = {};
    for (const field of fields) {
      const value = data[field.key];
      if (field.type === 'list') {
        if (!Array.isArray(value) || value.length > field.max || (field.fixed && value.length !== field.max)) throw new Error(`Check the ${field.label.toLowerCase()} list.`);
        result[field.key] = value.map(item => validate(field.fields, item));
        continue;
      }
      const clean = value === undefined && field.optional ? '' : typeof value === 'string' ? value.trim() : null;
      if (clean === null || (!clean && !field.optional) || clean.length > field.max) throw new Error(`Enter ${field.label.toLowerCase()} (up to ${field.max} characters).`);
      if (clean && field.type === 'url') {
        let valid = false;
        try { const url = new URL(clean); valid = ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch {}
        if (!valid) throw new Error(`Enter a complete http or https link for ${field.label.toLowerCase()}.`);
      }
      if (clean && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error('Enter a valid email address.');
      if (field.options && !field.options.includes(clean)) throw new Error(`Choose ${field.label.toLowerCase()} from the list.`);
      result[field.key] = clean;
    }
    return result;
  }
  const clean = validate(pageDefinitions[page].fields, content);
  if (page === 'events' && clean.series.some((item, i) => item.id !== series[i].id)) throw new Error('Keep the existing event series.');
  if (page === 'resources' && new Set(clean.resources.map(item => item.url)).size !== clean.resources.length) throw new Error('Each resource should have a different website link.');
  return clean;
}
