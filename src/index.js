import { JSONFilePreset } from "lowdb/node"
import { argv } from 'node:process';

// npx node src/index.js import
// npx node src/index.js search "<name1> <name2>

// import type { Low } from "lowdb"

// interface Recipe {
//   name: string
//   ingredients: string[]
//   instructions: string[]
// }

// type Data = {
//   recipes: Recipe[]
// }

let db;

async function openDatabase() {
  return await JSONFilePreset("db.json", { recipes: [] })
}

async function loadRecipes() {
  await db.read()
  return db.data.recipes
}

async function saveRecipes(recipes) {
  db.data = { recipes }
  db.write()
}

function getRecipeName() {
  return argv.slice(2).join(' ');
}

function searchByExactName(recipes, name) {
  return recipes.filter((recipe) => recipe.name === name);
}

async function main() {
  db = await openDatabase()

  const recipes = await loadRecipes()

  const searchCriteria = getRecipeName();

  const result = searchByExactName(recipes, searchCriteria)

  console.log(result);


  // recipes.push({
  //   name: "Pancakes",
  //   ingredients: ["flour", "milk", "eggs"],
  //   instructions: ["Mix", "Cook"],
  // })
  // await saveRecipes(recipes)
}

main()
