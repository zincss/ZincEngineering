'use server';

export interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string[];
  thumbnail: string;
  tags: string[]; // ADDED: To store tags like "Tart,Baking,Fruity"
  ingredients: { item: string; measure: string }[];
  youtube?: string;
  source?: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  thumbnail: string;
  matchCount?: number;
  totalSearchTerms?: number;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Breakfast': ['Breakfast'],
  'Lunch': ['Vegetarian', 'Starter', 'Side', 'Seafood', 'Pasta', 'Sandwich'],
  'Dinner': ['Beef', 'Chicken', 'Pork', 'Lamb', 'Goat', 'Seafood'],
  'Desserts': ['Dessert'],
  'Treats': ['Dessert'], 
  'Bake': ['Dessert'],
};

// --- HELPER: Parse API Meal to Recipe ---
function transformMealToRecipe(meal: any): Recipe {
  const ingredients: { item: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const item = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (item && item.trim() !== '') {
      ingredients.push({ item, measure });
    }
  }

  const rawInstructions = meal.strInstructions || '';
  const instructions = rawInstructions
    .split(/\r\n|\r|\n/)
    .map((step: string) => step.trim())
    .filter((step: string) => step.length > 3);

  // Parse Tags (e.g., "Meat,Casserole" -> ['Meat', 'Casserole'])
  const tags = meal.strTags ? meal.strTags.split(',').map((t: string) => t.trim()) : [];

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    instructions,
    thumbnail: meal.strMealThumb,
    tags, // Return the tags
    ingredients,
    youtube: meal.strYoutube,
    source: meal.strSource
  };
}

// 1. RANDOM BY CATEGORY
export async function getRandomRecipe(userCategory: string): Promise<Recipe | null> {
  try {
    const possibleCategories = CATEGORY_MAP[userCategory] || ['Miscellaneous'];
    const selectedApiCategory = possibleCategories[Math.floor(Math.random() * possibleCategories.length)];

    const listResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedApiCategory}`, { cache: 'no-store' });
    const listData = await listResponse.json();

    if (!listData.meals || listData.meals.length === 0) return null;

    const randomMealSummary = listData.meals[Math.floor(Math.random() * listData.meals.length)];
    return getRecipeById(randomMealSummary.idMeal);

  } catch (error) {
    console.error('Error fetching random recipe:', error);
    return null;
  }
}

// 2. SEARCH BY INGREDIENTS (Best Match Algorithm)
export async function searchRecipesByIngredients(ingredientsInput: string): Promise<RecipeSummary[]> {
  try {
    const searchTerms = ingredientsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 1); 

    if (searchTerms.length === 0) return [];

    const promises = searchTerms.map(async (term) => {
      const formattedTerm = term.replace(/\s+/g, '_');
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${formattedTerm}`, { cache: 'no-store' });
        const data = await res.json();
        return data.meals || [];
      } catch (e) {
        return [];
      }
    });

    const resultsArray = await Promise.all(promises);

    const recipeMap = new Map<string, { meal: any; count: number }>();

    resultsArray.forEach((meals) => {
      if (Array.isArray(meals)) {
        meals.forEach((meal: any) => {
          const existing = recipeMap.get(meal.idMeal);
          if (existing) {
            existing.count += 1;
          } else {
            recipeMap.set(meal.idMeal, { meal, count: 1 });
          }
        });
      }
    });

    const sortedRecipes = Array.from(recipeMap.values())
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        id: item.meal.idMeal,
        name: item.meal.strMeal,
        thumbnail: item.meal.strMealThumb,
        matchCount: item.count,
        totalSearchTerms: searchTerms.length
      }));

    return sortedRecipes;

  } catch (error) {
    console.error('Error searching by ingredients:', error);
    return [];
  }
}

// 3. GET SPECIFIC RECIPE (Full Details)
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`, { cache: 'force-cache' });
    const data = await response.json();
    const meal = data.meals?.[0];

    if (!meal) return null;
    return transformMealToRecipe(meal);

  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}