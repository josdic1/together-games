export type Character = {
  id: string
  name: string
  image: string
  // Optional look-alike group. Characters that share a `family` are
  // close visual variants of each other (same base design, different
  // color/costume/size) - used by games like Spot It to pick an "odd
  // one out" that actually resembles the crowd instead of a totally
  // unrelated character.
  family?: string
}

export const characters: Character[] = [
  { id: 'james-gabe', name: 'James Gabe', image: '/characters/james-gabe.png' },
  { id: 'roy', name: 'Roy the Snail', image: '/characters/roy.png' },
  { id: 'coco', name: 'Coco', image: '/characters/coco.png' },
  { id: 'nickel', name: 'Nickel', image: '/characters/nickel.png' },
  { id: 'rosie', name: 'Rosie', image: '/characters/rosie.png' },
  { id: 'flemish', name: 'Flemish', image: '/characters/flemish.png' },
  { id: 'dr-wierce', name: 'Dr. Wierce', image: '/characters/dr-wierce.png', family: 'wierce' },
  { id: 'copy-wierce', name: 'Copy Wierce', image: '/characters/copy-wierce.png', family: 'wierce' },
  { id: 'jim-baby', name: 'Jim Baby', image: '/characters/jim-baby.png' },
  { id: 'easy-tony', name: 'Easy Tony', image: '/characters/easy-tony.png', family: 'tony' },
  { id: 'tough-tony', name: 'Tough Tony', image: '/characters/tough-tony.png', family: 'tony' },
  { id: 'richie-loco', name: 'Richie Loco', image: '/characters/richie-loco.png' },
  { id: 'bruce-michael', name: 'Bruce Michael', image: '/characters/bruce-michael.png', family: 'bruce-michael' },
  { id: 'mini-bruce-michael', name: 'Mini Bruce Michael', image: '/characters/mini-bruce-michael.png', family: 'bruce-michael' },
  { id: 'party-james-lewis', name: 'Party James Lewis', image: '/characters/party-james-lewis.png', family: 'james-lewis' },
  { id: 'balloon-james-lewis', name: 'Balloon James Lewis', image: '/characters/balloon-james-lewis.png', family: 'james-lewis' },
  { id: 'joshua-david', name: 'Joshua David', image: '/characters/joshua-david.png', family: 'joshua-david' },
  { id: 'bad-joshua-david', name: 'Bad Joshua David', image: '/characters/bad-joshua-david.png', family: 'joshua-david' },
  { id: 'bogus', name: 'Bogus', image: '/characters/bogus.png' },
  { id: 'uncle-demi', name: 'Uncle Demi', image: '/characters/uncle-demi.png' },
  { id: 'rascal', name: 'Rascal', image: '/characters/rascal.png' },
]
