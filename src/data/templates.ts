export interface Template {
  id: string;
  name: string;
  image: string;
  type: 'blank' | 'preview';
}

export const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank Template',
    image: '',
    type: 'blank',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    image: '',
    type: 'preview',
  },
  {
    id: 'promotion',
    name: 'Promotion',
    image: '',
    type: 'preview',
  },
  {
    id: 'welcome',
    name: 'Welcome Email',
    image: '',
    type: 'preview',
  },
  {
    id: 'invoice',
    name: 'Invoice',
    image: '',
    type: 'preview',
  },
  {
    id: 'event',
    name: 'Event Invite',
    image: '',
    type: 'preview',
  },
  {
    id: 'announcement',
    name: 'Announcement',
    image: '',
    type: 'preview',
  },
  {
    id: 'product',
    name: 'Product Showcase',
    image: '',
    type: 'preview',
  },
  {
    id: 'survey',
    name: 'Survey',
    image: '',
    type: 'preview',
  },
  {
    id: 'thankyou',
    name: 'Thank You',
    image: '',
    type: 'preview',
  },
];
