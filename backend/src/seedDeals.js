import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Meal from "./models/Meal.js";
import Deal from "./models/Deal.js";

dotenv.config();

const THEMEALDB_URL = "https://www.themealdb.com/api/json/v1/1";

const mapMeal = (m) => ({
  externalMealId: m.idMeal,
  name: m.strMeal || "",
  category: m.strCategory || "",
  area: m.strArea || "",
  image: m.strMealThumb || "",
  instructions: m.strInstructions || "",
  youtubeUrl: m.strYoutube || "",

  ingredients: Array.from({ length: 20 }, (_, i) => ({
    ingredient: m[`strIngredient${i + 1}`] || "",
    measure: m[`strMeasure${i + 1}`] || "",
  })).filter((item) => item.ingredient),

  price: 450,
  isAvailable: true,
  isFeatured: false,
  discount: 0,
  rating: 4.5,
});

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
    const { data } = await axios.get(
      `${THEMEALDB_URL}/lookup.php?i=${id}`
    );

    return data?.meals?.[0] || null;
  } catch (error) {
    console.error(
      `Failed to fetch meal ${id}:`,
      error.response?.data || error.message
    );

    return null;
  }
};

const seedDeals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const mealCount = await Meal.countDocuments();

    if (mealCount === 0) {
      console.log("No meals found. Fetching meals from TheMealDB...");

      const categories = [
        "Chicken",
        "Beef",
        "Pork",
        "Seafood",
        "Vegetarian",
        "Dessert",
      ];

      const mealIds = new Set();

      for (const category of categories) {
        console.log(`Fetching ${category} meals...`);

        const meals = await fetchMealsByCategory(category);

        meals.slice(0, 5).forEach((meal) => {
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
        await mongoose.disconnect();
        return;
      }

      await Meal.insertMany(detailedMeals);

      console.log(
        `Seeded ${detailedMeals.length} meals successfully.`
      );
    } else {
      console.log(
        `Meals already seeded (${mealCount} found).`
      );
    }

    const dealCount = await Deal.countDocuments();

    if (dealCount > 0) {
      console.log(
        `Deals already seeded (${dealCount} found). Skipping.`
      );

      await mongoose.disconnect();
      return;
    }

    const meals = await Meal.find()
      .sort({ createdAt: -1 })
      .limit(6);

    if (meals.length === 0) {
      console.log("No meals available to create deals.");

      await mongoose.disconnect();
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

      const discountPercentage =
        discounts[index] || 20;

      const dealPrice = Math.round(
        originalPrice *
          (1 - discountPercentage / 100)
      );

      const startDate = new Date(now);

      const endDate = new Date(
        now.getTime() +
          (2 + index) * 24 * 60 * 60 * 1000
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

    console.log(
      `Seeded ${deals.length} deals successfully.`
    );

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
  } catch (error) {
    console.error(
      "Seeding failed:",
      error.response?.data || error.message
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedDeals();
