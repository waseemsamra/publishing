import { PlaceHolderImages } from './placeholder-images';
import type { Product, User, Order, MustHaveProduct } from './types';

const imageMap = PlaceHolderImages.reduce(
  (acc, img) => {
    acc[img.id] = img;
    return acc;
  },
  {} as Record<string, (typeof PlaceHolderImages)[0]>
);

export const products: Product[] = [
  {
    id: '1',
    name: 'HydroFlow Water Bottle',
    price: 24.99,
    description: 'Stay hydrated with our insulated stainless steel water bottle. Keeps drinks cold for 24 hours or hot for 12. BPA-free and built to last.',
    materials: ['Stainless Steel', 'Silicone'],
    certifications: ['B-Corp Certified', '1% for the Planet'],
    sustainabilityImpact: 'Reduces an average of 156 plastic bottles per year from entering landfills and oceans. Ethically manufactured in a solar-powered facility.',
    image: imageMap['product-1'],
  },
  {
    id: '2',
    name: 'EcoBrush Bamboo Toothbrush Set',
    price: 12.99,
    description: 'Make a sustainable switch with our pack of 4 bamboo toothbrushes. Features compostable handles and soft, BPA-free bristles.',
    materials: ['Bamboo', 'Nylon-6'],
    certifications: ['FSC Certified Bamboo', 'Vegan'],
    sustainabilityImpact: 'Fully biodegradable handle helps eliminate plastic waste. Bamboo is a fast-growing, renewable resource.',
    image: imageMap['product-2'],
  },
  {
    id: '3',
    name: 'TerraTote Canvas Bag',
    price: 19.99,
    description: 'A durable and stylish canvas tote bag perfect for groceries, errands, or daily use. Made from 100% organic cotton.',
    materials: ['Organic Cotton'],
    certifications: ['GOTS Certified Organic Cotton'],
    sustainabilityImpact: 'Each tote can save up to 500 plastic bags a year. Made with fair-trade practices.',
    image: imageMap['product-3'],
  },
  {
    id: '4',
    name: 'EverSip Steel Straws',
    price: 9.99,
    description: 'A set of 4 reusable stainless steel straws, complete with a cleaning brush and a convenient travel pouch. Dishwasher safe.',
    materials: ['Stainless Steel', 'Cotton'],
    certifications: [],
    sustainabilityImpact: 'Helps reduce the 500 million plastic straws used daily. A long-lasting alternative to single-use plastics.',
    image: imageMap['product-4'],
  },
  {
    id: '5',
    name: 'SunStream Solar Charger',
    price: 49.99,
    description: 'Charge your devices on the go with this compact and efficient solar-powered charger. Perfect for hiking, camping, or emergencies.',
    materials: ['Recycled Plastic', 'Monocrystalline Silicon'],
    certifications: ['RoHS Compliant'],
    sustainabilityImpact: 'Utilizes clean, renewable solar energy, reducing reliance on fossil fuels. Casing is made from 85% post-consumer recycled plastic.',
    image: imageMap['product-5'],
  },
  {
    id: '6',
    name: 'BeeWrap Food Wraps',
    price: 15.99,
    description: 'A set of 3 assorted-size beeswax food wraps. A natural, reusable, and compostable alternative to plastic wrap.',
    materials: ['Organic Cotton', 'Beeswax', 'Jojoba Oil', 'Tree Resin'],
    certifications: ['GOTS Certified Organic Cotton'],
    sustainabilityImpact: 'Eliminates single-use plastic wrap from your kitchen. Can be used for up to a year and is fully biodegradable.',
    image: imageMap['product-6'],
  },
  {
    id: '7',
    name: 'EcoSprout Compost Bin',
    price: 34.99,
    description: 'A sleek and odorless countertop compost bin for kitchen scraps. Includes a charcoal filter to control odors.',
    materials: ['Recycled Stainless Steel', 'Bamboo'],
    certifications: [],
    sustainabilityImpact: 'Diverts food waste from landfills, reducing methane emissions. Creates nutrient-rich compost for gardens.',
    image: imageMap['product-7'],
  },
  {
    id: '8',
    name: 'CloudSoft Wool Dryer Balls',
    price: 18.99,
    description: 'A set of 6 organic New Zealand wool dryer balls. Softens laundry naturally and reduces drying time by up to 25%.',
    materials: ['New Zealand Wool'],
    certifications: ['Leaping Bunny Certified'],
    sustainabilityImpact: 'Replaces single-use dryer sheets and chemical fabric softeners. Saves energy by shortening dryer cycles.',
    image: imageMap['product-8'],
  },
];

export const mustHaveProducts: MustHaveProduct[] = [
    {
        id: 'mh-1',
        name: 'Custom Coffee Bags',
        price: 'from £0.75 per unit',
        minUnits: 'Min. 500 units',
        delivery: 'Delivery: 4 - 5 weeks',
        badge: 'New',
        image: imageMap['must-have-1'],
    },
    {
        id: 'mh-2',
        name: 'Custom Poly Mailers',
        price: 'from £0.17 per unit',
        minUnits: 'Min. 25 units',
        delivery: 'Delivery: 4 - 5 weeks',
        image: imageMap['must-have-2'],
    },
    {
        id: 'mh-3',
        name: 'Custom Recyclable Coffee Cups',
        price: 'from £0.09 per unit',
        minUnits: 'Min. 1000 units',
        delivery: 'Delivery: 2 - 3 weeks',
        badge: 'PE',
        image: imageMap['must-have-3'],
    },
    {
        id: 'mh-4',
        name: 'Custom Multi Colored Tissue Paper',
        price: 'from £0.05 per unit',
        minUnits: 'Min. 250 units',
        delivery: 'Delivery: 2 weeks',
        image: imageMap['must-have-4'],
    },
    {
        id: 'mh-5',
        name: 'Custom Stickers',
        price: 'from £0.02 per unit',
        minUnits: 'Min. 1000 units',
        delivery: 'Delivery: 1 - 2 weeks',
        image: imageMap['must-have-5'],
    },
    {
        id: 'mh-6',
        name: 'Custom Food Grade Paper',
        price: 'from £0.12 per unit',
        minUnits: 'Min. 500 units',
        delivery: 'Delivery: 3 - 4 weeks',
        image: imageMap['must-have-1'],
    }
];


export const users: User[] = [
    { id: 'usr_1', name: 'Alice Johnson', email: 'alice@example.com', joinedDate: '2023-01-15' },
    { id: 'usr_2', name: 'Bob Williams', email: 'bob@example.com', joinedDate: '2023-02-20' },
    { id: 'usr_3', name: 'Charlie Brown', email: 'charlie@example.com', joinedDate: '2023-03-10' },
    { id: 'usr_4', name: 'Diana Miller', email: 'diana@example.com', joinedDate: '2023-04-05' },
    { id: 'usr_5', name: 'Ethan Davis', email: 'ethan@example.com', joinedDate: '2023-05-21' },
];

export const orders: Order[] = [
    { id: 'ord_1', customerName: 'Alice Johnson', date: '2024-05-01', total: 44.98, status: 'Delivered', itemCount: 2 },
    { id: 'ord_2', customerName: 'Bob Williams', date: '2024-05-03', total: 12.99, status: 'Shipped', itemCount: 1 },
    { id: 'ord_3', customerName: 'Charlie Brown', date: '2024-05-04', total: 68.98, status: 'Processing', itemCount: 2 },
    { id: 'ord_4', customerName: 'Alice Johnson', date: '2024-05-05', total: 15.99, status: 'Delivered', itemCount: 1 },
    { id: 'ord_5', customerName: 'Diana Miller', date: '2024-05-06', total: 18.99, status: 'Cancelled', itemCount: 1 },
];
