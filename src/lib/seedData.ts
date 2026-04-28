import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Meal } from '../types';

const SAMPLE_MEALS: Omit<Meal, 'id' | 'createdAt'>[] = [
  // UGANDA (6)
  {
    name: 'Matooke & G-nut Sauce',
    description: 'Traditional steamed green bananas served with a rich, creamy groundnut sauce.',
    price: 5000,
    category: 'Traditional',
    country: 'Uganda',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=1000'
  },
  {
    name: 'Beef Luwombo',
    description: 'Tender beef slow-cooked in a banana leaf with a secret blend of herbs.',
    price: 12000,
    category: 'Main Dish',
    country: 'Uganda',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1547928501-a2a30b651034?q=80&w=1000'
  },
  {
    name: 'Rolex (Egg Roll)',
    description: 'The iconic Ugandan street food: chapati rolled with eggs, cabbage, and tomatoes.',
    price: 3000,
    category: 'Quick Bite',
    country: 'Uganda',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1000'
  },
  {
    name: 'Katogo (Early Bird)',
    description: 'A hearty breakfast of matooke mixed with beef or offal stew.',
    price: 6000,
    category: 'Daily Special',
    country: 'Uganda',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000'
  },
  {
    name: 'Goat Muchomo',
    description: 'Succulent roasted goat meat served with gonja (roasted plantain).',
    price: 15000,
    category: 'Main Dish',
    country: 'Uganda',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000'
  },
  {
    name: 'Posho & Beans',
    description: 'The student staple: finely milled cornmeal served with yellow bean stew. Personalize with your choice of meat or accompaniment.',
    price: 4000,
    category: 'Traditional',
    country: 'Uganda',
    isAvailable: true,
    meatOptions: ['Fried Fish', 'Beef Stew', 'Chicken Piece', 'Liver stew'],
    accompanimentOptions: ['Rice', 'Matooke', 'Cassava'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000'
  },

  // SOMALIA (6)
  {
    name: 'Bariis Iskukaris',
    description: 'Somali pilaf made with fragrant basmati rice, spices, and raisins.',
    price: 8000,
    category: 'Main Dish',
    country: 'Somalia',
    isAvailable: true,
    meatOptions: ['Grilled Goat', 'Beef Suqaar', 'Chicken Slices'],
    accompanimentOptions: ['Banana', 'Kachumbari Salad', 'Muufo Piece'],
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c80df9358b?q=80&w=1000'
  },
  {
    name: 'Sambuusa (Meat)',
    description: 'Golden crispy pastry filled with spiced minced meat and onions.',
    price: 2000,
    category: 'Quick Bite',
    country: 'Somalia',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb17797?q=80&w=1000'
  },
  {
    name: 'Canjeero with Sugar',
    description: 'Sourdough Somali pancake often served with sesame oil and a sprinkle of sugar.',
    price: 3000,
    category: 'Daily Special',
    country: 'Somalia',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee9a?q=80&w=1000'
  },
  {
    name: 'Beef Suqaar',
    description: 'Small cubes of beef sautéed with colorful vegetables and Somali spices.',
    price: 9000,
    category: 'Main Dish',
    country: 'Somalia',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=1000'
  },
  {
    name: 'Muufo (Cornbread)',
    description: 'Somali flatbread made from cornmeal, cooked in a clay oven.',
    price: 2500,
    category: 'Traditional',
    country: 'Somalia',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000'
  },
  {
    name: 'Sabayad & Stew',
    description: 'Layered Somali flatbread served with a thick lamb or goat stew.',
    price: 11000,
    category: 'Main Dish',
    country: 'Somalia',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1512058560566-42724afbc2aa?q=80&w=1000'
  },

  // ERITREA (6)
  {
    name: 'Zigni (Beef Stew)',
    description: 'The spicy national dish: beef simmered in Berbere spice and clarified butter.',
    price: 13000,
    category: 'Traditional',
    country: 'Eritrea',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000'
  },
  {
    name: 'Injera with Tsebhi',
    description: 'Soft, sourdough flatbread topped with various spicy stews.',
    price: 9000,
    category: 'Main Dish',
    country: 'Eritrea',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1541014741259-df549fa9bc67?q=80&w=1000'
  },
  {
    name: 'Shiro (Chickpea)',
    description: 'Silky, flavorful chickpea flour stew—a staple during fasting seasons.',
    price: 7000,
    category: 'Daily Special',
    country: 'Eritrea',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000'
  },
  {
    name: 'Hilbet',
    description: 'A traditional paste made of lentils, beans, and fenugreek.',
    price: 5000,
    category: 'Traditional',
    country: 'Eritrea',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1538067329391-45cdcf937400?q=80&w=1000'
  },
  {
    name: 'Kitcha Fit-fit',
    description: 'Torn pieces of unleavened bread tossed in Berbere spice and butter.',
    price: 6000,
    category: 'Quick Bite',
    country: 'Eritrea',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1599307737356-9c4c79872589?q=80&w=1000'
  },
  {
    name: 'Ga\'at (Porridge)',
    description: 'Thick stiff porridge served with a well of spicy butter and yogurt.',
    price: 8000,
    category: 'Traditional',
    country: 'Eritrea',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1547225284-53c898687a41?q=80&w=1000'
  },

  // DR CONGO (6)
  {
    name: 'Moambe Chicken',
    description: 'Savory chicken cooked in a rich palm nut butter sauce with spinach.',
    price: 15000,
    category: 'Traditional',
    country: 'DR Congo',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=1000'
  },
  {
    name: 'Pondu (Sakasaka)',
    description: 'Cassava leaves pounded and stewed with palm oil and garden eggs.',
    price: 6000,
    category: 'Main Dish',
    country: 'DR Congo',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27f704525cc0?q=80&w=1000'
  },
  {
    name: 'Fufu & Fish',
    description: 'Elastic dough made from cassava and plantain, served with tilapia.',
    price: 12000,
    category: 'Main Dish',
    country: 'DR Congo',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000'
  },
  {
    name: 'Liboke de Poisson',
    description: 'Fish seasoned with spices and steamed inside large green leaves.',
    price: 14000,
    category: 'Traditional',
    country: 'DR Congo',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000'
  },
  {
    name: 'Makayabu (Salt Fish)',
    description: 'Salted fish cooked with cabbage and onions, a true Congolese favorite.',
    price: 10000,
    category: 'Daily Special',
    country: 'DR Congo',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1551248429-4285544d7c6a?q=80&w=1000'
  },
  {
    name: 'Chikwangue',
    description: 'Stiff cassava bread steamed in banana leaves, perfect for soaking stews.',
    price: 4000,
    category: 'Quick Bite',
    country: 'DR Congo',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000'
  },

  // NIGERIA (6)
  {
    name: 'Jollof Rice (Party)',
    description: 'The world-famous Nigerian smoky rice cooked in a rich tomato base.',
    price: 9000,
    category: 'Main Dish',
    country: 'Nigeria',
    isAvailable: true,
    meatOptions: ['Fried Chicken', 'Grilled Beef', 'Assorted Meat'],
    accompanimentOptions: ['Fried Plantain', 'Coleslaw', 'Moi Moi'],
    imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=1000'
  },
  {
    name: 'Egusi & Pounded Yam',
    description: 'Melon seed soup with okra and greens, served with smooth yam dough.',
    price: 12000,
    category: 'Traditional',
    country: 'Nigeria',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1541014741259-df549fa9bc67?q=80&w=1000'
  },
  {
    name: 'Suya (Spiced Beef)',
    description: 'Street-style skewered beef rubbed with Yaji (peanut-based spice blend).',
    price: 10000,
    category: 'Quick Bite',
    country: 'Nigeria',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6e94d1840?q=80&w=1000'
  },
  {
    name: 'Akara (Bean Cakes)',
    description: 'Deep-fried black-eyed bean cakes, fluffy and savory.',
    price: 4000,
    category: 'Quick Bite',
    country: 'Nigeria',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb17797?q=80&w=1000'
  },
  {
    name: 'Efo Riro (Vegetable)',
    description: 'Hearty Spinach and pepper stew served with Assorted meat.',
    price: 11000,
    category: 'Daily Special',
    country: 'Nigeria',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000'
  },
  {
    name: 'Moi Moi',
    description: 'Steamed bean pudding made from a mix of peeled black-eyed beans.',
    price: 5000,
    category: 'Daily Special',
    country: 'Nigeria',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000'
  },

  // SUDAN (6)
  {
    name: 'Ful Medames',
    description: 'Slow-cooked fava beans served with oil, cumin, and fresh bread.',
    price: 5000,
    category: 'Daily Special',
    country: 'Sudan',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27f704525cc0?q=80&w=1000'
  },
  {
    name: 'Kisra & Stew',
    description: 'Fermented sorghram flatbread served with various meat and veg stews.',
    price: 8000,
    category: 'Main Dish',
    country: 'Sudan',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee9a?q=80&w=1000'
  },
  {
    name: 'Gurasa',
    description: 'Thick fermented flatbread similar to a pancake, served with honey or stew.',
    price: 4000,
    category: 'Quick Bite',
    country: 'Sudan',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000'
  },
  {
    name: 'Kawari (Hooves Stew)',
    description: 'A traditional Somali-Sudanese delicacies: rich, gelatinous hoof stew.',
    price: 15000,
    category: 'Traditional',
    country: 'Sudan',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000'
  },
  {
    name: 'Aseeda',
    description: 'Thick, smooth porridge made of wheat flour or cornmeal, served with stew.',
    price: 7000,
    category: 'Traditional',
    country: 'Sudan',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1547058881-1277a16d8e8b?q=80&w=1000'
  },
  {
    name: 'Sudanese Shaya',
    description: 'Charcoal-grilled thin slices of spicy, marinated lamb or beef.',
    price: 12000,
    category: 'Main Dish',
    country: 'Sudan',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6e94d1840?q=80&w=1000'
  }
];

export async function seedMeals() {
  const mealsCol = collection(db, 'meals');
  const snapshot = await getDocs(mealsCol);
  
  if (snapshot.empty) {
    console.log('Seeding meals...');
    for (const meal of SAMPLE_MEALS) {
      await addDoc(mealsCol, {
        ...meal,
        createdAt: new Date().toISOString()
      });
    }
    console.log('Seeding complete.');
  }
}
