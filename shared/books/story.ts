/**
 * The five sample books: fictional children, original characters, complete
 * mini-stories with a beginning, a problem, a kind resolution and a final
 * read-aloud line. Eight spreads each (illustration left, text right).
 *
 * These are SAMPLES. Customer books are written and illustrated to order from
 * the brief collected in the builder.
 */
import type { StoryId, StyleId } from "./catalog";
import { storyInfo } from "./catalog";
import type { Look, PetLook } from "./art";

export interface Spread { text: string }

export interface SampleBook {
  story: StoryId;
  title: string;
  style: StyleId;
  child: { name: string; look: Look; age: string };
  pet?: { name: string; look: PetLook };
  dedication: string;
  spreads: Spread[];
}

export const SAMPLES: SampleBook[] = [
  {
    story: "snow-globe",
    title: "Mila and the Midnight Snow Globe",
    style: "pastel",
    child: { name: "Mila", age: "5", look: { skin: "#E8B996", hair: "#7A4A2A", hairStyle: "bunches", outfit: "#B8D4E8", glasses: false } },
    pet: { name: "Biscuit", look: { kind: "dog", fur: "#C98B52", patch: "#FFF4E6" } },
    dedication: "For Mila,\nwho always hears the snow first.",
    spreads: [
      { text: "On Christmas Eve, Mila couldn’t sleep. Neither could Biscuit. The snow globe on the windowsill was glowing." },
      { text: "Inside the globe, the tiny village was dark. Its star was missing. And across the windowsill went a line of tiny, glittery footprints." },
      { text: "Mila pulled on her boots. Biscuit pulled on nothing, because he is a dog. Together they followed the footprints out into the snowy garden." },
      { text: "Under the holly bush they found a very small star, sniffling. “I fell off the top of the village,” it said. “Now I can’t find my way back.”" },
      { text: "Biscuit sniffed. Biscuit wagged. Biscuit’s nose could follow the footprints backwards! Off they went, past the shed and over the frozen birdbath." },
      { text: "Back inside, the snow globe was too high and too slippery. Mila made steps out of books. Biscuit held the bottom. Mostly." },
      { text: "Mila lifted the little star up, up, up, and set it gently on top of the snowy village. Every tiny window lit up at once." },
      { text: "Snow swirled. Biscuit yawned. “Thank you,” whispered the star. Goodnight, little star. Goodnight, Biscuit. Goodnight, Mila." },
    ],
  },
  {
    story: "sock-dragon",
    title: "Theo and the Sock-Stealing Dragon",
    style: "cartoon",
    child: { name: "Theo", age: "6", look: { skin: "#F2CBA8", hair: "#E0A33A", hairStyle: "short", outfit: "#E2574C", glasses: true } },
    dedication: "For Theo,\nkeeper of odd socks.",
    spreads: [
      { text: "Every morning, Theo found the same thing: one sock, all alone. “Where do the other socks go?” he asked. Nobody knew." },
      { text: "So one night, Theo stayed awake. Creak went the window. Swish went a tail. And off went his stripy sock, up into the dark." },
      { text: "In the morning there was a trail. A red sock on the gate. A spotty sock on the hedge. A fluffy sock halfway up the hill." },
      { text: "At the top of the hill was a cave. In the cave was a dragon. And on the dragon were forty-seven socks. “Atchoo!” said the dragon." },
      { text: "“I’m Flint,” he sniffed. “My fire went out. My toes are freezing.” Theo looked at the socks. Then he looked at Flint’s enormous feet." },
      { text: "“Taking socks isn’t fair,” said Theo. “But being cold isn’t nice either. I have an idea.”" },
      { text: "Theo brought wool. Grandad brought needles. The whole street knitted. By teatime, Flint had four warm socks of his very own. Four very long socks." },
      { text: "Flint’s toes warmed up. His fire came back with a happy puff. And every sock went home to its pair. Even the spotty one." },
    ],
  },
  {
    story: "moonlight-delivery",
    title: "Aisha and the Moonlight Delivery",
    style: "comic",
    child: { name: "Aisha", age: "7", look: { skin: "#8A5A3C", hair: "#1F1A1C", hairStyle: "puffs", outfit: "#F2C14E", glasses: false } },
    pet: { name: "Pepper", look: { kind: "cat", fur: "#2E2A33", patch: "#F5F0E6" } },
    dedication: "For Aisha,\nwho never misses a delivery.",
    spreads: [
      { text: "Ding-dong! A parcel arrived at Aisha’s door, wrapped in silver paper. The address said: The Moon." },
      { text: "“The moon doesn’t have a letterbox,” said Aisha. Her cat, Pepper, sat down on the parcel. That meant: we’re taking it." },
      { text: "Out of the window and onto the roof they went. Chimney to chimney, gutter to gutter. Tiptoe, tiptoe… LEAP!" },
      { text: "On the highest roof, a pigeon in a postman’s cap shook his head. “The moon? You’ll need the moonbeam ladder. It only comes down at midnight.”" },
      { text: "BONG went the town clock, twelve times. A ladder of silver light slid down from the sky. Pepper went first. Of course." },
      { text: "Up and up they climbed, past sleepy clouds and one very surprised owl. Below them, the town looked like a tray of tiny lights." },
      { text: "The moon opened the parcel with a big round smile. Inside was a night-light. “For when it’s my turn to be dark,” said the moon. “Thank you!”" },
      { text: "Aisha and Pepper slid home on a moonbeam and landed on the bed. Boing! Look outside tonight. If the moon is extra bright, now you know why." },
    ],
  },
  {
    story: "little-wonders",
    title: "Finn and the Map of Little Wonders",
    style: "watercolour",
    child: { name: "Finn", age: "5", look: { skin: "#F6D7C3", hair: "#B5522E", hairStyle: "curly", outfit: "#4F7A5A", glasses: false } },
    dedication: "For Finn,\nwho always looks closer.",
    spreads: [
      { text: "Finn had a favourite thing to say. Whenever something was puzzling, he said, “Let’s look closer!”" },
      { text: "One windy afternoon, his friend Rosa ran into the park in tears. “My lucky shell! I’ve lost it!”" },
      { text: "Finn unfolded his Map of Little Wonders. It showed the ant hill, the hollow tree, the wobbly bridge, and the duck who only likes crusts." },
      { text: "They searched the sandpit. Nothing. They searched under the slide. One shoelace and a very old crisp. Rosa sniffed." },
      { text: "“Let’s look closer!” said Finn. And there on the map was a tiny drawing he’d never noticed: a magpie holding something shiny." },
      { text: "They tiptoed to the hollow tree. Up on a branch, a magpie was admiring its treasures. Bottle tops. A key. And a pink, swirly shell." },
      { text: "Finn offered the magpie his shiniest button instead. The magpie thought about it. Then, plink! Down dropped the lucky shell." },
      { text: "Rosa held her shell tight. Finn drew two friends and a magpie on the map. “Next time something’s lost,” said Rosa, “let’s look closer!”" },
    ],
  },
  {
    story: "small-parade",
    title: "Nia and the Very Small Parade",
    style: "collage",
    child: { name: "Nia", age: "4", look: { skin: "#5E3B25", hair: "#16110F", hairStyle: "braids", outfit: "#E58AA7", glasses: false } },
    pet: { name: "Clover", look: { kind: "rabbit", fur: "#D9D2C5", patch: "#FFFFFF" } },
    dedication: "For Nia,\nwho makes room for everyone.",
    spreads: [
      { text: "On Bramble Street, everyone was getting ready for the parade. There were drums, and ribbons, and a dog dressed as a carrot." },
      { text: "Everyone except Mr Doyle at number nine. He watched from behind his curtains. “Oh, I couldn’t,” he said. “I’m not a parade sort of person.”" },
      { text: "Nia and her rabbit, Clover, had a think. Clover thought with her nose. Nia thought with her whole face." },
      { text: "“What do you like doing, Mr Doyle?” asked Nia. “Well,” he said quietly, “I grow very small tomatoes. And I can whistle.”" },
      { text: "So Nia made a plan. Not a big plan. A very small plan, just the right size for Mr Doyle." },
      { text: "When the parade came down Bramble Street, there was a new part at the very end: a wheelbarrow float, full of very small tomatoes." },
      { text: "Mr Doyle pushed it. Clover rode on top. And Mr Doyle whistled the street’s favourite song, so softly that everyone hushed to hear it." },
      { text: "Then everyone joined in. That night, Mr Doyle left his curtains open. And next year, the parade starts at number nine." },
    ],
  },
];

export function sampleFor(story: StoryId): SampleBook {
  return SAMPLES.find((s) => s.story === story) ?? SAMPLES[0];
}

export function sampleTitle(story: StoryId): string {
  return storyInfo(story)?.sampleTitle ?? sampleFor(story).title;
}
