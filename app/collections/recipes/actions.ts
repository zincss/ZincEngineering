'use server';

export interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string[];
  thumbnail: string;
  tags: string[];
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

  // 1. Split raw text by any newline format
  const rawInstructions = meal.strInstructions || '';
  const lines = rawInstructions
    .split(/\r\n|\r|\n/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  // 2. Smart Merge & Clean
  const cleanInstructions: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if the line is just a label like "Step 1", "1.", "Step 1:", "Method"
    const isStepLabel = /^(step\s*)?\d+[:.]?$|^method[:.]?$/i.test(line);

    // If it's a label and there is a next line, skip this line (the next line has the text)
    if (isStepLabel && i + 1 < lines.length) {
      continue;
    }

    // Clean the current line: Remove leading "1.", "Step 1 -", etc. to avoid double numbering in UI
    const text = line.replace(/^(step\s*)?\d+[:.\-]\s*/i, '');

    // Only add if there is substantial text remaining
    if (text.length > 2) {
       cleanInstructions.push(text);
    }
  }

  // Parse Tags
  const tags = meal.strTags ? meal.strTags.split(',').map((t: string) => t.trim()) : [];

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: cleanInstructions, // Use the cleaned array
    thumbnail: meal.strMealThumb,
    tags,
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

// 2. SEARCH BY INGREDIENTS
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

// 3. GET SPECIFIC RECIPE
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