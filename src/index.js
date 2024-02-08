import { JSONFilePreset } from "lowdb/node"
import { argv } from "node:process"
import { readFile } from "node:fs/promises"

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

function displayIngredient({quantity, unit, description}) {
  if (quantity && unit) {
    return `${quantity} ${unit} ${description}`
  }

  if (quantity) {
    return `${quantity} ${description}`
  }

  return description
}

function displayRecipe(recipe) {
  return `${recipe.name}
${"-".repeat(recipe.name.length)}

Ingredients:
${recipe.ingredients.map(displayIngredient).join("\n")}

Instructions:
${recipe.method.map((instruction, index) => `${index + 1}. ${instruction}`).join("\n")}`
}

function searchCommand(recipes) {
  const searchCriteria = getRecipeName()

  const results = searchByExactName(recipes, searchCriteria)

  const output = results.map(displayRecipe).join("\n\n\n")
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
      searchCommand(recipes)
      break

    case "import":
      importCommand(recipes)
      break

    default:
      console.error(`Unknown command: ${argv[2]}`)
  }
}

main()
