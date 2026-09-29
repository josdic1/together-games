import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playTap, playWin } from '../../shared/sound'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import './RichieBakeryPage.css'

type Difficulty = 'easy' | 'mid' | 'hard'
type Ingredient = { id: string; label: string; art: string }
type Recipe = { name: string; ingredients: Ingredient[] }
type Phase = 'choose' | 'demo' | 'build' | 'done'

const I = (id: string, label: string, art = id): Ingredient => ({ id, label, art })
const INGREDIENTS = {
  bottomBun: I('bottom-bun', 'Bottom bun', 'bun-bottom'),
  patty: I('patty', 'Burger patty'),
  cheese: I('cheese', 'Cheese'),
  lettuce: I('lettuce', 'Lettuce'),
  tomato: I('tomato', 'Tomato'),
  ketchup: I('ketchup', 'Ketchup'),
  topBun: I('top-bun', 'Top bun', 'bun-top'),
  iceCream: I('ice-cream', 'Ice cream'),
  chocolate: I('chocolate', 'Chocolate sauce'),
  whipped: I('whipped', 'Whipped cream'),
  sprinkles: I('sprinkles', 'Sprinkles'),
  cherry: I('cherry', 'Cherry'),
  flour: I('flour', 'Flour'),
  butter: I('butter', 'Butter'),
  sugar: I('sugar', 'Sugar'),
  egg: I('egg', 'Egg'),
  chips: I('chips', 'Chocolate chips'),
  dough: I('dough', 'Dough'),
  sauce: I('sauce', 'Tomato sauce'),
  pepperoni: I('pepperoni', 'Pepperoni'),
  pancake: I('pancake', 'Pancake'),
  syrup: I('syrup', 'Syrup'),
  berries: I('berries', 'Berries'),
  shell: I('shell', 'Taco shell'),
  beef: I('beef', 'Beef'),
  salsa: I('salsa', 'Salsa'),
  cake: I('cake', 'Cake'),
  frosting: I('frosting', 'Frosting'),
  bread: I('bread', 'Bread'),
  turkey: I('turkey', 'Turkey'),
} as const

const RECIPES: Recipe[] = [
  { name: 'Burger', ingredients: [INGREDIENTS.bottomBun, INGREDIENTS.patty, INGREDIENTS.cheese, INGREDIENTS.lettuce, INGREDIENTS.tomato, INGREDIENTS.ketchup, INGREDIENTS.topBun] },
  { name: 'Ice Cream Sundae', ingredients: [INGREDIENTS.iceCream, INGREDIENTS.chocolate, INGREDIENTS.whipped, INGREDIENTS.sprinkles, INGREDIENTS.cherry] },
  { name: 'Cookies', ingredients: [INGREDIENTS.flour, INGREDIENTS.butter, INGREDIENTS.sugar, INGREDIENTS.egg, INGREDIENTS.chips] },
  { name: 'Pizza', ingredients: [INGREDIENTS.dough, INGREDIENTS.sauce, INGREDIENTS.cheese, INGREDIENTS.pepperoni] },
  { name: 'Pancakes', ingredients: [INGREDIENTS.pancake, INGREDIENTS.syrup, INGREDIENTS.butter, INGREDIENTS.berries] },
  { name: 'Taco', ingredients: [INGREDIENTS.shell, INGREDIENTS.beef, INGREDIENTS.cheese, INGREDIENTS.lettuce, INGREDIENTS.salsa] },
  { name: 'Cupcake', ingredients: [INGREDIENTS.cake, INGREDIENTS.frosting, INGREDIENTS.sprinkles, INGREDIENTS.cherry] },
  { name: 'Sandwich', ingredients: [INGREDIENTS.bread, INGREDIENTS.turkey, INGREDIENTS.cheese, INGREDIENTS.lettuce, INGREDIENTS.tomato, INGREDIENTS.bread] },
]

const DIFFICULTY: Record<Difficulty, { max: number; demoMs: number }> = {
  easy: { max: 4, demoMs: 900 },
  mid: { max: 5, demoMs: 700 },
  hard: { max: 7, demoMs: 520 },
}

function shuffled(items: Ingredient[], seed: number) {
  const next = [...items]
  let state = (Math.floor(seed * 1000) || 1) >>> 0
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

function IngredientArt({ ingredient }: { ingredient: Ingredient }) {
  return <img className="ingredient-art ingredient-art--drawn" src={`/art/bakery-ingredients/${ingredient.art}.svg`} alt="" draggable={false} />
}

function RecipePreview({ recipe }: { recipe: Recipe }) {
  const slug = recipe.name.toLowerCase().replaceAll(' ', '-')
  return <img className="recipe-preview recipe-preview--dish" src={`/art/bakery-dishes/${slug}.svg`} alt="" draggable={false} />
}

export default function RichieBakeryPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [roundIngredients, setRoundIngredients] = useState<Ingredient[]>([])
  const [phase, setPhase] = useState<Phase>('choose')
  const [demoIndex, setDemoIndex] = useState(0)
  const [built, setBuilt] = useState<Ingredient[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const [pantry, setPantry] = useState<Ingredient[]>([])
  const timerRef = useRef<number | null>(null)
  const { setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({ competitive: false, label: phase === 'choose' ? 'PICK A DISH' : phase === 'demo' ? 'WATCH THE ORDER' : phase === 'build' ? 'REBUILD IT' : 'ORDER UP' })
  }, [phase, setStatus])

  useEffect(() => {
    if (phase !== 'demo' || roundIngredients.length === 0) return undefined
    if (demoIndex >= roundIngredients.length) {
      timerRef.current = window.setTimeout(() => {
        setBuilt([])
        setPhase('build')
      }, 550)
      return () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current) }
    }
    timerRef.current = window.setTimeout(() => setDemoIndex((value) => value + 1), DIFFICULTY[difficulty].demoMs)
    return () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current) }
  }, [demoIndex, difficulty, phase, roundIngredients.length])

  function choose(nextRecipe: Recipe, seed: number) {
    playTap()
    const selected = nextRecipe.ingredients.slice(0, DIFFICULTY[difficulty].max)
    setRecipe(nextRecipe)
    setRoundIngredients(selected)
    setDemoIndex(0)
    setBuilt([])
    setWrong(null)
    setPantry(shuffled(selected, seed))
    setPhase('demo')
  }

  function addIngredient(ingredient: Ingredient) {
    if (!recipe || phase !== 'build') return
    const expected = roundIngredients[built.length]
    if (!expected || ingredient.id !== expected.id) {
      setWrong(ingredient.id)
      window.setTimeout(() => setWrong(null), 420)
      return
    }
    playTap()
    const next = [...built, ingredient]
    setBuilt(next)
    if (next.length === roundIngredients.length) {
      playWin()
      setPhase('done')
    }
  }

  return (
    <main className="bakery-game">
      <header className="bakery-topbar">
        <Link to="/" className="bakery-home">Games</Link>
        <div><span>Rosie remembers the recipe</span><h1>Rosie's Bakery</h1></div>
        <button type="button" onClick={() => setPhase('choose')}>Menu</button>
      </header>

      <section className="bakery-stage">
        <img className="bakery-rosie bakery-rosie--left" src="/characters/rosie.png" alt="Rosie the unicorn" draggable={false} />
        <img className="bakery-rosie bakery-rosie--right" src="/characters/rosie.png" alt="" draggable={false} />

        {phase === 'choose' ? (
          <div className="bakery-menu">
            <div className="bakery-menu__top">
              <h2>What should Rosie make?</h2>
              <div className="bakery-difficulty" aria-label="Difficulty">
                {(['easy', 'mid', 'hard'] as Difficulty[]).map((level) => <button type="button" key={level} className={difficulty === level ? 'is-active' : ''} onClick={() => setDifficulty(level)}>{level}</button>)}
              </div>
            </div>
            <div className="bakery-recipes">{RECIPES.map((item) => <button type="button" key={item.name} onClick={(event) => choose(item, event.timeStamp)}><RecipePreview recipe={item} /><strong>{item.name}</strong></button>)}</div>
          </div>
        ) : recipe ? (
          <div className="bakery-workbench">
            <div className="bakery-order"><strong>{recipe.name}</strong><span>{difficulty}</span></div>
            <div className="bakery-plate" aria-label="Plate">
              {(phase === 'demo' ? roundIngredients.slice(0, demoIndex) : built).map((item, index) => <span className="bakery-layer" key={`${item.id}-${index}`}><IngredientArt ingredient={item} /><small>{item.label}</small></span>)}
            </div>

            {phase === 'demo' && <div className="bakery-demo"><strong>WATCH THE ORDER</strong><span>{roundIngredients[demoIndex]?.label || 'Ready?'}</span></div>}
            {phase === 'build' && <div className="bakery-pantry">{pantry.map((item, index) => <button type="button" className={wrong === item.id ? 'is-wrong' : ''} key={`${item.id}-${index}`} onClick={() => addIngredient(item)}><IngredientArt ingredient={item} /><strong>{item.label}</strong></button>)}</div>}
            {phase === 'done' && <div className="bakery-done"><strong>ORDER UP</strong><button type="button" onClick={() => setPhase('choose')}>Make another</button></div>}
          </div>
        ) : null}
      </section>
    </main>
  )
}
