import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Meal from "./models/Meal.js";
import Deal from "./models/Deal.js";

dotenv.config();

const THEMEALDB_URL = "https://www.themealdb.com/api/json/v1/1";

/* =========================================================
   REALISTIC PRICE + RATING MAPS
   ========================================================= */

const BASE_PRICE_BY_CATEGORY = {
  Beef: 750,
  Chicken: 550,
  Dessert: 250,
  Lamb: 850,
  Miscellaneous: 450,
  Pasta: 500,
  Pork: 700,
  Seafood: 900,
  Side: 200,
  Starter: 300,
  Vegan: 400,
  Vegetarian: 350,
  Breakfast: 250,
  Goat: 800,
};

const AREA_MULTIPLIER = {
  French: 1.25,
  Italian: 1.2,
  Japanese: 1.3,
  Chinese: 1.05,
  Thai: 1.1,
  Indian: 0.95,
  Mexican: 1.0,
  American: 1.1,
  British: 1.05,
  Mediterranean: 1.15,
  Greek: 1.1,
  Spanish: 1.1,
  Moroccan: 0.95,
  Egyptian: 0.9,
  Croatian: 1.0,
  Dutch: 1.0,
  Filipino: 0.95,
  Irish: 1.0,
  Jamaican: 1.05,
  Kenyan: 0.9,
  Malaysian: 1.0,
  Norwegian: 1.25,
  Polish: 0.95,
  Portuguese: 1.05,
  Russian: 1.0,
  Tunisian: 0.95,
  Turkish: 1.0,
  Ukrainian: 1.0,
  Uruguayan: 1.0,
  Vietnamese: 1.0,
};

/* =========================================================
   HELPERS
   ========================================================= */

const roundToNearest = (value, step = 10) =>
  Math.round(value / step) * step;

const calculatePrice = (category, area, mealName = "") => {
  const base = BASE_PRICE_BY_CATEGORY[category] || 450;
  const areaMult = AREA_MULTIPLIER[area] || 1.0;

  const hash = mealName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variance = ((hash % 21) - 10) / 100;

  const lengthBonus = Math.min(mealName.length, 40) / 400;

  const price = base * areaMult * (1 + variance + lengthBonus);

  return roundToNearest(price, 10);
};

const calculateRating = (mealName = "") => {
  const hash = mealName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const base = 3.9 + (hash % 12) / 10;
  return Math.min(5.0, Math.round(base * 10) / 10);
};

/* =========================================================
   MAP MEAL FROM THEMEALDB
   ========================================================= */

const mapMeal = (m) => {
  const name = m.strMeal || "";
  const category = m.strCategory || "";
  const area = m.strArea || "";

  return {
    externalMealId: m.idMeal,
    name,
    category,
    area,
    image: m.strMealThumb || "",
    instructions: m.strInstructions || "",
    youtubeUrl: m.strYoutube || "",

    ingredients: Array.from({ length: 20 }, (_, i) => ({
      ingredient: m[`strIngredient${i + 1}`] || "",
      measure: m[`strMeasure${i + 1}`] || "",
    })).filter((item) => item.ingredient),

    price: calculatePrice(category, area, name),
    rating: calculateRating(name),

    isAvailable: true,
    isFeatured: false,
    discount: 0,
  };
};

/* =========================================================
   FETCH HELPERS
   ========================================================= */

const fetchMealsByCategory = async (category) => {
  try {
    const { data } = await axios.get(
      `${THEMEALDB_URL}/filter.php?c=${encodeURIComponent(category)}`
    );
    return data?.meals || [];
  } catch (error) {
    console.error(
      `Failed to fetch ${category}:`,
      error.response?.data || error.message
    );
    return [];
  }
};

const fetchMealDetails = async (id) => {
  try {
    const { data } = await axios.get(`${THEMEALDB_URL}/lookup.php?i=${id}`);
    return data?.meals?.[0] || null;
  } catch (error) {
    console.error(
      `Failed to fetch meal ${id}:`,
      error.response?.data || error.message
    );
    return null;
  }
};

/* =========================================================
   SEED MEALS (fresh fetch)
   ========================================================= */

const seedMeals = async () => {
  console.log("No meals found. Fetching meals from TheMealDB...");

  const categories = [
    "Chicken",
    "Beef",
    "Pork",
    "Seafood",
    "Vegetarian",
    "Dessert",
    "Pasta",
    "Lamb",
    "Breakfast",
    "Side",
  ];

  const mealIds = new Set();

  for (const category of categories) {
    console.log(`Fetching ${category} meals...`);
    const meals = await fetchMealsByCategory(category);
    meals.slice(0, 10).forEach((meal) => {
      mealIds.add(meal.idMeal);
    });
  }

  console.log(`Found ${mealIds.size} unique meals.`);

  const detailedMeals = [];

  for (const id of mealIds) {
    const meal = await fetchMealDetails(id);
    if (meal) {
      detailedMeals.push(mapMeal(meal));
    }
  }

  if (detailedMeals.length === 0) {
    console.log("No meals fetched from TheMealDB.");
    return 0;
  }

  await Meal.insertMany(detailedMeals);
  console.log(`Seeded ${detailedMeals.length} meals successfully.`);

  console.log("\nSample prices:");
  detailedMeals.slice(0, 6).forEach((m) => {
    console.log(
      `  - ${m.name} (${m.category}) -> Rs. ${m.price} | Rating: ${m.rating}`
    );
  });
  console.log("");

  return detailedMeals.length;
};

/* =========================================================
   REPRICE MEALS (fix any meals still at old price)
   ========================================================= */

const repriceMeals = async () => {
  const atOldPrice = await Meal.countDocuments({ price: 450 });

  if (atOldPrice === 0) {
    console.log("All meals already have realistic prices.");
    return 0;
  }

  console.log(`Found ${atOldPrice} meals at Rs. 450. Repricing all meals...`);

  const allMeals = await Meal.find();
  let updated = 0;
  const bulkOps = [];

  for (const meal of allMeals) {
    const newPrice = calculatePrice(meal.category, meal.area, meal.name);
    const newRating = calculateRating(meal.name);

    if (meal.price !== newPrice || meal.rating !== newRating) {
      bulkOps.push({
        updateOne: {
          filter: { _id: meal._id },
          update: { $set: { price: newPrice, rating: newRating } },
        },
      });
      updated++;
    }
  }

  if (bulkOps.length > 0) {
    await Meal.bulkWrite(bulkOps);
    console.log(`Repriced ${updated} meals with realistic values.`);
  }

  return updated;
};

/* =========================================================
   SEED DEALS
   ========================================================= */

const seedDealsForMeals = async () => {
  const dealCount = await Deal.countDocuments();

  if (dealCount > 0) {
    console.log(`Deals already seeded (${dealCount} found). Skipping.`);
    return;
  }

  const meals = await Meal.find().sort({ createdAt: -1 }).limit(6);

  if (meals.length === 0) {
    console.log("No meals available to create deals.");
    return;
  }

  const now = new Date();
  const discounts = [20, 30, 25, 40, 15, 35];
  const badges = [
    "Hot Deal",
    "Super Saver",
    "Limited Time",
    "Best Seller",
    "Flash Sale",
    "Chef's Pick",
  ];

  const deals = meals.map((meal, index) => {
    const originalPrice = meal.price || 450;
    const discountPercentage = discounts[index] || 20;
    const dealPrice = Math.round(
      originalPrice * (1 - discountPercentage / 100)
    );

    const startDate = new Date(now);
    const endDate = new Date(
      now.getTime() + (2 + index) * 24 * 60 * 60 * 1000
    );

    return {
      title: `${discountPercentage}% OFF ${meal.name}`,
      description: `Limited-time deal on ${meal.name}. Grab it before it ends!`,
      meal: meal._id,
      discountPercentage,
      originalPrice,
      dealPrice,
      startDate,
      endDate,
      isActive: true,
      maxClaims: 50,
      claimedCount: 0,
      image: meal.image || "",
      badge: badges[index] || "Hot Deal",
    };
  });

  await Deal.insertMany(deals);
  console.log(`Seeded ${deals.length} deals successfully.`);

  console.log("\nDeals created:");
  deals.forEach((d) => {
    console.log(
      `  - ${d.title} -> Rs. ${d.dealPrice} (was Rs. ${d.originalPrice})`
    );
  });
  console.log("");
};

/* =========================================================
   MAIN
   ========================================================= */

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Optional --force flag wipes meals and deals
    const force = process.argv.includes("--force");

    if (force) {
      console.log("Force flag detected. Deleting all meals and deals...");
      await Meal.deleteMany({});
      await Deal.deleteMany({});
      console.log("Deleted.");
    }

    const mealCount = await Meal.countDocuments();

    if (mealCount === 0) {
      await seedMeals();
    } else {
      console.log(`Meals already seeded (${mealCount} found).`);
      // Always check and reprice any meals at 450
      await repriceMeals();
    }

    // Seed deals if none exist
    await seedDealsForMeals();

    await mongoose.disconnect();
    console.log("MongoDB disconnected. Seeding complete.");
  } catch (error) {
    console.error(
      "Seeding failed:",
      error.response?.data || error.message
    );
    await mongoose.disconnect();
    process.exit(1);
  }
};

main();