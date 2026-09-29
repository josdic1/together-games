import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playTap, playWin } from '../../shared/sound'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import './RichieBakeryPage.css'

type Recipe = { name: string; emoji: string; ingredients: string[] }

const RECIPES: Recipe[] = [
  { name: 'Burger', emoji: '🍔', ingredients: ['Bottom bun','Patty','Cheese','Lettuce','Tomato','Top bun'] },
  { name: 'Ice Cream Sundae', emoji: '🍨', ingredients: ['Ice cream','Chocolate','Whipped cream','Sprinkles','Cherry'] },
  { name: 'Cookies', emoji: '🍪', ingredients: ['Flour','Butter','Sugar','Egg','Chocolate chips'] },
  { name: 'Pizza', emoji: '🍕', ingredients: ['Dough','Sauce','Cheese','Pepperoni'] },
  { name: 'Pancakes', emoji: '🥞', ingredients: ['Pancake','Syrup','Butter','Berries'] },
  { name: 'Taco', emoji: '🌮', ingredients: ['Shell','Beef','Cheese','Lettuce','Salsa'] },
  { name: 'Cupcake', emoji: '🧁', ingredients: ['Cake','Frosting','Sprinkles','Cherry'] },
  { name: 'Sandwich', emoji: '🥪', ingredients: ['Bread','Turkey','Cheese','Lettuce','Bread'] },
]

type Phase = 'choose' | 'demo' | 'build' | 'done'

function shuffledUnique(items: string[], seed: number) {
  const next = [...new Set(items)]
  let state = (Math.floor(seed * 1000) || 1) >>> 0
  const nextRandom = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(nextRandom() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

export default function RichieBakeryPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [phase, setPhase] = useState<Phase>('choose')
  const [demoIndex, setDemoIndex] = useState(0)
  const [built, setBuilt] = useState<string[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const [pantry, setPantry] = useState<string[]>([])
  const timerRef = useRef<number | null>(null)
  const { setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({ competitive: false, label: phase === 'choose' ? 'PICK A DISH' : phase === 'demo' ? 'WATCH' : phase === 'build' ? 'YOUR TURN' : 'NICE!' })
  }, [phase, setStatus])

  useEffect(() => {
    if (phase !== 'demo' || !recipe) return undefined
    if (demoIndex >= recipe.ingredients.length) {
      timerRef.current = window.setTimeout(() => {
        setBuilt([])
        setPhase('build')
      }, 650)
      return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
    }
    timerRef.current = window.setTimeout(() => setDemoIndex((value) => value + 1), 700)
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [demoIndex, phase, recipe])

  function choose(next: Recipe, seed: number) {
    playTap()
    setRecipe(next)
    setDemoIndex(0)
    setBuilt([])
    setWrong(null)
    setPantry(shuffledUnique(next.ingredients, seed))
    setPhase('demo')
  }

  function addIngredient(ingredient: string) {
    if (!recipe || phase !== 'build') return
    const expected = recipe.ingredients[built.length]
    if (ingredient !== expected) {
      setWrong(ingredient)
      window.setTimeout(() => setWrong(null), 400)
      return
    }
    playTap()
    const next = [...built, ingredient]
    setBuilt(next)
    if (next.length === recipe.ingredients.length) {
      playWin()
      setPhase('done')
    }
  }


  return (
    <main className="bakery-game">
      <header className="bakery-topbar">
        <Link to="/" className="bakery-home">← Games</Link>
        <h1>Richie Loco's Bakery</h1>
        <button type="button" onClick={() => setPhase('choose')}>Menu</button>
      </header>

      <section className="bakery-stage">
        <img className="bakery-richie" src="/characters/richie-loco.png" alt="Richie Loco" />
        <img className="bakery-demi" src="/characters/uncle-demi.png" alt="Uncle Demi" />

        {phase === 'choose' ? (
          <div className="bakery-menu">
            <h2>What should we make?</h2>
            <div>{RECIPES.map((item) => <button type="button" key={item.name} onClick={(event) => choose(item, event.timeStamp)}><span>{item.emoji}</span><strong>{item.name}</strong></button>)}</div>
          </div>
        ) : recipe ? (
          <div className="bakery-workbench">
            <div className="bakery-order"><span>{recipe.emoji}</span><strong>{recipe.name}</strong></div>
            <div className="bakery-plate" aria-label="Plate">
              {phase === 'demo' && recipe.ingredients.slice(0, demoIndex).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
              {phase !== 'demo' && built.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
              {phase === 'done' && <b>{recipe.emoji}</b>}
            </div>

            {phase === 'demo' && <div className="bakery-demo"><strong>WATCH THE ORDER</strong><span>{recipe.ingredients[demoIndex] || 'Ready?'}</span></div>}
            {phase === 'build' && <div className="bakery-pantry">{pantry.map((item) => <button type="button" className={wrong === item ? 'is-wrong' : ''} key={item} onClick={() => addIngredient(item)}>{item}</button>)}</div>}
            {phase === 'done' && <div className="bakery-done"><strong>ORDER UP!</strong><button type="button" onClick={() => setPhase('choose')}>Make another</button></div>}
          </div>
        ) : null}
      </section>
    </main>
  )
}
