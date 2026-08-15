import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const enquiries = [];
const experiences = [
  { id: 'damota', name: 'Mount Damota sunrise', type: 'Nature', duration: 'Half day', note: 'A gentle dawn walk with panoramic highland views.' },
  { id: 'gifata', name: 'Gifata culture day', type: 'Culture', duration: 'Full day', note: 'Music, storytelling, woven traditions and local welcome.' },
  { id: 'coffee', name: 'Coffee & enset table', type: 'Food', duration: '3 hours', note: 'Meet growers and share a slow, generous table.' }
];

app.use(express.json());
app.use(express.static(__dirname));
app.get('/api/experiences', (_req, res) => res.json(experiences));
app.post('/api/enquiries', (req, res) => {
  const { name, email, date, interests, travelers = 1 } = req.body || {};
  if (!name || !email || !interests) return res.status(400).json({ message: 'Name, email and interests are required.' });
  const enquiry = { id: `VW-${String(enquiries.length + 1).padStart(4, '0')}`, name, email, date, interests, travelers: Number(travelers), createdAt: new Date().toISOString() };
  enquiries.push(enquiry);
  res.status(201).json({ message: 'Your journey note has reached our local hosts.', reference: enquiry.id });
});
app.get('/api/health', (_req, res) => res.json({ status: 'ready', enquiries: enquiries.length }));
app.listen(process.env.PORT || 3000, () => console.log('Visit Wolaita is running at http://localhost:3000'));
