// data/productData.js
export const categories = [
  { name: "Electronics", description: "Gadgets, accessories and consumer electronics", image: "https://picsum.photos/seed/electronics/400/260" },
  { name: "Clothing", description: "Men and Women apparel, trending fashion", image: "https://picsum.photos/seed/clothing/400/260" },
  { name: "Home Appliances", description: "Appliances for home use and convenience", image: "https://picsum.photos/seed/homeappliances/400/260" },
  { name: "Books", description: "Fiction, non-fiction and educational books", image: "https://picsum.photos/seed/books/400/260" },
  { name: "Groceries", description: "Daily essentials and grocery items", image: "https://picsum.photos/seed/groceries/400/260" },
  { name: "Toys", description: "Toys and games for kids of all ages", image: "https://picsum.photos/seed/toys/400/260" },
  { name: "Sports", description: "Sports gear and fitness equipment", image: "https://picsum.photos/seed/sports/400/260" },
  { name: "Beauty", description: "Cosmetics, skincare and grooming", image: "https://picsum.photos/seed/beauty/400/260" },
  { name: "Footwear", description: "Shoes, sandals and sports footwear", image: "https://picsum.photos/seed/footwear/400/260" },
  { name: "Stationery", description: "Office and school stationery items", image: "https://picsum.photos/seed/stationery/400/260" },
  { name: "Furniture", description: "Home and office furniture", image: "https://picsum.photos/seed/furniture/400/260" },
  { name: "Automotive", description: "Car and bike accessories", image: "https://picsum.photos/seed/automotive/400/260" },
  { name: "Jewellery", description: "Necklaces, rings and fashion jewellery", image: "https://picsum.photos/seed/jewellery/400/260" },
  { name: "Gardening", description: "Plants, tools and gardening supplies", image: "https://picsum.photos/seed/gardening/400/260" },
  { name: "Pet Supplies", description: "Food and accessories for pets", image: "https://picsum.photos/seed/pets/400/260" }
];

const sampleDescriptions = [
  "High quality and durable.",
  "Best in class performance.",
  "Affordable and long-lasting.",
  "Customer favorite item.",
  "Compact and stylish design.",
  "Lightweight and easy to use.",
  "Top-rated by customers.",
  "Eco-friendly and efficient.",
  "Trending product of the season.",
  "New arrival with improved features."
];

export const generateProducts = () => {
  const products = [];
  categories.forEach((cat, idx) => {
    for (let i = 1; i <= 25; i++) {
      const name = `${cat.name} Product ${i}`;
      const desc = sampleDescriptions[(i + idx) % sampleDescriptions.length];
      const mrp = parseFloat((Math.random() * 9000 + 500).toFixed(2));
      const discounted = parseFloat((mrp * (0.7 + Math.random() * 0.25)).toFixed(2));
      const qty = Math.floor(Math.random() * 200 + 5);
      products.push({
        name,
        mrp_price: mrp,
        discounted_price: discounted,
        quantity: qty,
        category_id: idx + 1,
        description: desc,
        image: `https://picsum.photos/seed/${encodeURIComponent(cat.name + "-" + i)}/480/320`
      });
    }
  });
  return products;
};
