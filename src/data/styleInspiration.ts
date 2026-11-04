export type InspirationCategory = 'Beauty' | 'Skincare' | 'Hair' | 'Fashion' | 'Self-care';

export interface InspirationItem {
  slug: string;
  title: string;
  description: string;
  category: InspirationCategory;
  mood: string;
  image: string;
  imageAlt: string;
  label: string;
  productSearch: string;
  featured: boolean;
  guide: { introduction: string; steps: string[] };
}

const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const INSPIRATION_CATEGORIES: {
  name: InspirationCategory;
  title: string;
  description: string;
  image: string;
  filter: string;
}[] = [
  { name: 'Beauty', title: 'Beauty Looks', description: 'Makeup ideas, from barely-there to evening glow.', image: photo('photo-1522335789203-aabd1fc54bc9'), filter: 'Natural Makeup' },
  { name: 'Skincare', title: 'Skincare Inspiration', description: 'Thoughtful routines and little moments of care.', image: photo('photo-1608248543803-ba4f8c70ae0b'), filter: 'Glowing Skin' },
  { name: 'Hair', title: 'Hair Inspiration', description: 'Fresh styling ideas and hair-care rituals.', image: photo('photo-1524504388940-b1c1722653e1'), filter: 'Haircare Routines' },
  { name: 'Fashion', title: 'Outfit & Accessories', description: 'Personal style, finishing touches, and new pairings.', image: photo('photo-1483985988355-763728e1935b'), filter: 'Everyday Outfits' },
  { name: 'Self-care', title: 'Self-Care Moments', description: 'Make room for a slower, softer kind of reset.', image: photo('photo-1540555700478-4be289fbeCEF'), filter: 'At-Home Spa' },
];

export const GLOW_MOODS = [
  'Soft & Natural',
  'Elegant & Classy',
  'Romantic & Feminine',
  'Bold & Confident',
  'Minimal & Clean',
  'Glamorous & Luxurious',
  'Fresh & Effortless',
];

export const STYLE_INSPIRATION: InspirationItem[] = [
  {
    slug: 'soft-pink-everyday-glow',
    title: 'Soft Pink, Everyday Glow',
    description: 'A fresh, rosy take on everyday beauty. Keep the palette soft, blend sheer color, and let your own features lead.',
    category: 'Beauty',
    mood: 'Soft & Natural',
    image: photo('photo-1487412720507-e7ab37603c6f'),
    imageAlt: 'Beauty editorial portrait with soft, natural makeup',
    label: 'The beauty edit',
    productSearch: 'makeup',
    featured: true,
    guide: { introduction: 'Build a soft-pink look at your own pace, choosing textures and shades that feel comfortable for you.', steps: ['Start with your usual skin preparation and let each layer settle.', 'Choose one soft rosy shade and apply a little at a time.', 'Blend edges gently for a diffused finish.', 'Add a touch of lip color that complements your chosen look.'] },
  },
  {
    slug: 'the-simple-morning-ritual',
    title: 'The Simple Morning Ritual',
    description: 'A calm start built around the products you already enjoy: a few considered steps and a moment to yourself.',
    category: 'Skincare',
    mood: 'Minimal & Clean',
    image: photo('photo-1556229010-6c3f2c9ca5f8'),
    imageAlt: 'Skincare products arranged for a simple morning routine',
    label: 'A moment for you',
    productSearch: 'skincare',
    featured: true,
    guide: { introduction: 'There is no one-size-fits-all routine. Use products that suit your preferences and follow their labels.', steps: ['Begin with the cleansing step that fits your routine.', 'Apply your chosen skincare products in the order shown on their labels.', 'Give each step a moment before moving to the next.', 'Finish with daytime sun protection when appropriate for you.'] },
  },
  {
    slug: 'a-little-evening-glam',
    title: 'A Little Evening Glam',
    description: 'A playful evening edit with a statement detail. Choose one feature to emphasize and keep the rest personal.',
    category: 'Beauty',
    mood: 'Glamorous & Luxurious',
    image: photo('photo-1515886657613-9f3515b0c78f'),
    imageAlt: 'Fashion and beauty editorial in a polished evening look',
    label: 'After-hours notes',
    productSearch: 'lip gloss',
    featured: true,
    guide: { introduction: 'Create an evening look by choosing a focal point, then making the rest of the details feel balanced.', steps: ['Pick the feature or color you want to lead the look.', 'Use your preferred tools to apply color in light layers.', 'Check the look in the lighting where you plan to wear it.', 'Keep a favorite touch-up item nearby if you like.'] },
  },
  {
    slug: 'skin-prep-and-a-soft-reset',
    title: 'Skin Prep & a Soft Reset',
    description: 'A gentle self-care interlude: make your space comfortable and follow a familiar, unhurried routine.',
    category: 'Self-care',
    mood: 'Fresh & Effortless',
    image: photo('photo-1570172619644-dfd03ed5d881'),
    imageAlt: 'A relaxing self-care moment with skincare',
    label: 'The self-care journal',
    productSearch: 'face mask',
    featured: false,
    guide: { introduction: 'Turn an ordinary evening into a small reset without adding pressure or extra steps.', steps: ['Set aside a few minutes in a space where you feel comfortable.', 'Choose a familiar skincare or body-care product and follow its directions.', 'Put on a favorite playlist or enjoy a quiet pause.', 'Finish with one small thing that helps you feel ready to unwind.'] },
  },
  {
    slug: 'the-polished-finishing-touch',
    title: 'The Polished Finishing Touch',
    description: 'Accessories can change the feeling of an outfit. Try a favorite piece with a simple look and see what feels like you.',
    category: 'Fashion',
    mood: 'Elegant & Classy',
    image: photo('photo-1539109136881-3be0616acf4b'),
    imageAlt: 'An elegant fashion look with carefully chosen accessories',
    label: 'Personal style',
    productSearch: 'jewelry',
    featured: true,
    guide: { introduction: 'Use accessories as a way to make a familiar outfit feel distinctly your own.', steps: ['Start with an outfit you already feel good wearing.', 'Choose one accessory as the focal point.', 'Add another detail only if it feels balanced to you.', 'Make a final comfort check before heading out.'] },
  },
  {
    slug: 'easy-texture-everyday-hair',
    title: 'Easy Texture, Everyday Hair',
    description: 'A low-pressure styling idea that works with your natural texture and the routine you already know.',
    category: 'Hair',
    mood: 'Fresh & Effortless',
    image: photo('photo-1529139574466-a303027c1d8b'),
    imageAlt: 'Beauty editorial featuring an easy, natural hairstyle',
    label: 'Hair notes',
    productSearch: 'hair',
    featured: false,
    guide: { introduction: 'Treat this as a starting point, adapting each step to your hair texture and the directions for the products you use.', steps: ['Begin with hair prepared in the way that works for you.', 'Work in small sections using a comfortable styling method.', 'Use accessories or products only as directed.', 'Let the finished style feel relaxed rather than perfectly uniform.'] },
  },
  {
    slug: 'the-soft-glam-edit',
    title: 'The Soft Glam Edit',
    description: 'A balanced beauty mood: softly defined details, a touch of sheen, and room to make the look your own.',
    category: 'Beauty',
    mood: 'Romantic & Feminine',
    image: photo('photo-1488426862026-3ee34a7d66df'),
    imageAlt: 'Soft glam makeup inspiration portrait',
    label: 'Editor\'s pick',
    productSearch: 'makeup brush',
    featured: true,
    guide: { introduction: 'Soft glam is about the finish you enjoy. Adjust the color and coverage to your comfort.', steps: ['Prepare your skin with your usual routine.', 'Apply complexion products in light, buildable layers.', 'Blend a soft shade across the areas you want to define.', 'Finish with a lip or cheek color that brings the palette together.'] },
  },
  {
    slug: 'a-slower-at-home-spa',
    title: 'A Slower At-Home Spa',
    description: 'Bring a spa-like pause home with a comfortable setting, a familiar body-care ritual, and no complicated checklist.',
    category: 'Self-care',
    mood: 'Soft & Natural',
    image: photo('photo-1515377905703-c4788e51af15'),
    imageAlt: 'Quiet at-home self-care inspiration',
    label: 'A moment for you',
    productSearch: 'body care',
    featured: false,
    guide: { introduction: 'A self-care routine can be as simple as making a little space to slow down.', steps: ['Choose a time when you can take a comfortable pause.', 'Gather any familiar body-care items you want to use.', 'Follow product directions and avoid anything that does not suit you.', 'End with a calming activity that you enjoy.'] },
  },
];
