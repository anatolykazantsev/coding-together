import { JSONFilePreset } from "lowdb/node"
import type { Low } from "lowdb"

interface Recipe {
  name: string
  ingredients: string[]
  instructions: string[]
}

type Data = {
  recipes: Recipe[]
}

let db: Low<Data>

async function openDatabase() {
  return await JSONFilePreset<Data>("db.json", { recipes: [] })
}

async function loadRecipes(): Promise<Recipe[]> {
  await db.read()
  return db.data.recipes
}

async function saveRecipes(recipes: Recipe[]) {
  db.data = { recipes }
  db.write()
}

async function main() {
  db = await openDatabase()

  const recipes = await loadRecipes()
  recipes.push({
    name: "Pancakes",
    ingredients: ["flour", "milk", "eggs"],
    instructions: ["Mix", "Cook"],
  })
  await saveRecipes(recipes)
}

main()
