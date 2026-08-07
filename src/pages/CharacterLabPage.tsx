import Whale from '../art/characters/Whale'

export default function CharacterLabPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--paper)',
      }}
    >
      <div style={{ width: 360 }}>
        <Whale />
      </div>
    </main>
  )
}
