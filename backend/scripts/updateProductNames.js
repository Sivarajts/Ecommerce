import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "ecommdb",
  waitForConnections: true,
  connectionLimit: 10,
});

const categoryNameSets = {
  1: { brands: ["Samsung","Apple","LG","Sony","OnePlus","Xiaomi","Realme","Motorola","Panasonic","Canon"], models: ["Ultra","Pro","Max","X","S","Plus","Neo","Prime","Zoom","Lite"] },
  2: { brands: ["Levi's","Nike","Adidas","Puma","H&M","Zara","Uniqlo","Gap","Tommy","Lee"], models: ["Slim Jeans","Casual Tee","Hoodie","Chino","Bomber Jacket","Denim Shirt","Track Pants","Polo Shirt","Summer Dress","Windbreaker"] },
  3: { brands: ["Whirlpool","Bosch","IFB","LG","Samsung","Panasonic","Haier","Bajaj","Philips","Hitachi"], models: ["Washing Machine","Microwave","Refrigerator","Air Conditioner","Mixer Grinder","Vacuum Cleaner","Water Purifier","Induction Cooktop","Food Processor","Water Heater"] },
  4: { brands: ["Penguin","Random House","HarperCollins","O'Reilly","Macmillan","Simon & Schuster","Bloomsbury","Pearson","Scholastic","Hachette"], models: ["The Journey","Life Lessons","Mastering JavaScript","Cooking Simplified","Business Strategies","The Unknown","Mindful Living","Short Stories","Adventure Tales","Academic Guide"] },
  5: { brands: ["Amul","Nestle","Britannia","Tata","Haldiram","Gits","MDH","Patanjali","Kellogg's","Kissan"], models: ["Milk 1L","Tea 250g","Olive Oil 500ml","Wheat Flour 1kg","Rice 5kg","Sugar 1kg","Biscuits Pack","Spices Combo","Paneer 200g","Honey 250g"] },
  6: { brands: ["Lego","Hasbro","Mattel","Fisher-Price","Funskool","Rubbabu","Hot Wheels","Play-Doh","Barbie","Tomy"], models: ["Building Set","Action Figure","Puzzle","Educational Kit","Toy Car","Soft Plush","Board Game","Water Gun","Remote Car","Singing Toy"] },
  7: { brands: ["Nike","Adidas","Puma","Decathlon","Yonex","Wilson","Reebok","ASICS","Under Armour","New Balance"], models: ["Football","Cricket Bat","Tennis Racket","Sports Shoes","Yoga Mat","Dumbbell Set","Cycling Helmet","Running Shorts","Fitness Band","Basketball"] },
  8: { brands: ["Maybelline","Lakme","L'Oreal","Nykaa","Colorbar","The Body Shop","Nivea","Garnier","Clinique","MAC"], models: ["Lipstick","Foundation","Moisturizer","Face Wash","Sunscreen","Serum","Shampoo","Conditioner","Face Mask","Perfume"] },
  9: { brands: ["Nike","Adidas","Reebok","Skechers","Clarks","Bata","Red Tape","Sparx","Puma","Woodland"], models: ["Running Shoes","Loafers","Sandals","Formal Shoes","Sneakers","Sports Sandals","Flip Flops","Boots","Casual Slip-ons","Canvas Shoes"] },
  10: { brands: ["Camlin","Faber-Castell","Cello","Reynolds","Classmate","Staedtler","Pilot","Pentel","Kokuyo","Linc"], models: ["Ball Pen","Notebook","Markers","Highlighter","Pencil Set","Eraser","Sharpener","Drawing Pad","Glue Stick","Stapler"] },
  11: { brands: ["Ikea","Nilkamal","Wakefit","Urban Ladder","Damro","Godrej","HomeTown","Peacock","Amber","Casa"], models: ["Dining Table","Sofa Set","Study Table","Bookshelf","Wardrobe","TV Unit","Coffee Table","Bed Frame","Recliner","Office Chair"] },
  12: { brands: ["Bosch","3M","Pioneer","Michelin","Hero","Bajaj","Mahindra","Castrol","Exide","Yamaha"], models: ["Car Battery","Tyre 15inch","Car Seat Cover","Helmet","Riding Gloves","Oil Filter","GPS Tracker","Car Charger","Air Freshener","Bike Chain"] },
  13: { brands: ["Tanishq","Kalyan","PC Jeweller","CaratLane","Malabar","Joyalukkas","Senco","Kohinoor","Orra","Candere"], models: ["Gold Necklace","Diamond Ring","Earrings","Bangle Set","Pendant","Bracelet","Anklet","Studs","Mangalsutra","Watch"] },
  14: { brands: ["Gardena","Bosch","Plantify","NurseryPro","Ryobi","Sunrise","GreenThumb","PlantCare","Gardenshop","HomeGreen"], models: ["Pot Plant","Soil Mix","Gardening Tool Set","Watering Can","Pruner","Plant Food","Seed Pack","Hanging Planter","Garden Lights","Compost Bin"] },
  15: { brands: ["Drools","Pedigree","Whiskas","Royal Canin","Farmina","Hill's","Doggies","PetSafe","IAMS","PawTree"], models: ["Dog Food 2kg","Cat Food 1kg","Pet Shampoo","Chew Toy","Pet Bed","Leash","Cat Litter","Pet Bowl","Grooming Kit","Puppy Milk"] },
};

function buildNames(catId, n = 25) {
  const cfg = categoryNameSets[catId];
  const names = [];
  for (let i = 0; i < n; i++) {
    const brand = cfg.brands[i % cfg.brands.length];
    const model = cfg.models[i % cfg.models.length];
    const variant = i >= 10 ? ` ${100 + i}` : "";
    names.push(`${brand} ${model}${variant}`);
  }
  // ensure uniqueness (should be unique by algorithm)
  return Array.from(new Set(names)).slice(0, n);
}

const updateNamesForCategory = async (categoryId, names) => {
  const [rows] = await pool.query("SELECT id FROM products WHERE category_id = ? ORDER BY id ASC", [categoryId]);
  const limit = Math.min(rows.length, names.length);
  for (let i = 0; i < limit; i++) {
    await pool.query("UPDATE products SET name = ? WHERE id = ?", [names[i], rows[i].id]);
  }
  console.log(`✅ Category ${categoryId} updated: ${limit} products`);
};

(async () => {
  try {
    for (let cat = 1; cat <= 15; cat++) {
      const names = buildNames(cat, 25);
      await updateNamesForCategory(cat, names);
    }
    console.log("✅ All categories updated");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating names:", err);
    process.exit(1);
  }
})();
