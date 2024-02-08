import { JSONFilePreset } from "lowdb/node"
import { argv } from "node:process"
import { readFile } from "node:fs/promises"
import FuzzySearch from "fuzzy-search";

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

let db

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
  return argv.slice(3).join(" ")
}

function searchByExactName(recipes, name) {
  return recipes.filter((recipe) => recipe.name === name)
}

function fuzzySearch(recipes, name) {
  const searcher = new FuzzySearch(recipes, ["name"]);
  return searcher.search(name).slice(0, 4);
}

function convertMeasurementSystem(measurementSystem, quantity, unit) {
  switch (measurementSystem) {
    case "-i":
      if (unit === 'g') {
        return {
          unit: 'oz',
          quantity: quantity / 28.3495
        }
      }
    case "-m":
      if (unit === 'oz') {
        return {
          unit: 'g',
          quantity: quantity * 28.3495
        }
      }
    default:
      return { quantity, unit }
  }
}

function displayIngredient({quantity, unit, description}, measurementSystem) {
  if (quantity && unit) {
    const { quantity: q , unit: u } = convertMeasurementSystem(measurementSystem, quantity, unit)
    return `${q} ${u} ${description}`
  }

  if (quantity) {
    return `${quantity} ${description}`
  }

  return description
}

function displayRecipe(recipe, measurementSystem) {
  return `${recipe.name}
${"-".repeat(recipe.name.length)}

Ingredients:
${recipe.ingredients.map((ingredient) => displayIngredient(ingredient, measurementSystem)).join("\n")}

Instructions:
${recipe.method.map((instruction, index) => `${index + 1}. ${instruction}`).join("\n")}`
}

function searchCommand(recipes, measurementSystem) {
  const searchCriteria = getRecipeName()

  let results = searchByExactName(recipes, searchCriteria)
  
  if (results.length == 0) {
    results = fuzzySearch(recipes, searchCriteria)
  }

  const output = results
    .map((recipe) => displayRecipe(recipe, measurementSystem))
    .join("\n\n\n")
  console.log(output)
}

async function importCommand(recipes) {
  const data = await readFile(argv[3], { encoding: "utf8" })
  const newRecipes = JSON.parse(data)

  db.data.recipes.push(...newRecipes)
  saveRecipes(recipes)
}

async function main() {
  db = await openDatabase()

  const recipes = await loadRecipes()

  switch (argv[2]) {
    case "search":
      let measurementSystem = null;
      if (['-i', '-m'].includes(argv[3])) {
        measurementSystem = argv[3]
        argv.splice(3, 1);
      }

      searchCommand(recipes, measurementSystem)
      break

    case "import":
      importCommand(recipes)
      break

    default:
      console.error(`Unknown command: ${argv[2]}`)
  }
}

main()
