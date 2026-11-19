import { verbFromText } from "../src/videos/story/pose2d.ts";

const sentences = [
  // History (15)
  { domain: "history", text: "The Roman legion marched across the dusty road." },
  { domain: "history", text: "Cleopatra sailed down the Nile river on her royal barge." },
  { domain: "history", text: "The pharaoh built a massive stone pyramid in the desert." },
  { domain: "history", text: "Knights fought bravely with swords during the medieval siege." },
  { domain: "history", text: "The emperor sat upon his golden throne and decreed a new law." },
  { domain: "history", text: "Vikings sailed their longship across the stormy northern seas." },
  { domain: "history", text: "Ancient scribes wrote historical records on papyrus scrolls." },
  { domain: "history", text: "The thief crept into the palace and stole the golden crown." },
  { domain: "history", text: "Explorers discovered hidden treasure inside the dark cave." },
  { domain: "history", text: "The weary traveller drank water from a wooden cup." },
  { domain: "history", text: "Workers dug deep tunnels inside the royal mine." },
  { domain: "history", text: "The hunter aimed his wooden bow at the running deer." },
  { domain: "history", text: "Citizens cheered as the victorious army returned home." },
  { domain: "history", text: "The monk read an ancient manuscript by candle light." },
  { domain: "history", text: "Traders exchanged spices and silk at the busy marketplace." },

  // Space (15)
  { domain: "space", text: "The astronaut floated effortlessly in zero gravity." },
  { domain: "space", text: "Rocket engines roared as the spacecraft launched into orbit." },
  { domain: "space", text: "Satellites beamed signals back to mission control on Earth." },
  { domain: "space", text: "Telescopes scanned distant galaxies for unknown planets." },
  { domain: "space", text: "The lunar rover drove across the grey cratered moon." },
  { domain: "space", text: "Astronauts conducted spacewalks outside the orbiting station." },
  { domain: "space", text: "Meteors streaked across the dark night sky in a brilliant flash." },
  { domain: "space", text: "The crew repaired damaged solar panels on the hull." },
  { domain: "space", text: "Scientists analyzed alien rock samples in the laboratory." },
  { domain: "space", text: "A massive asteroid drifted silently through the void." },
  { domain: "space", text: "The probe photographed the swirling storms of Jupiter." },
  { domain: "space", text: "Spacecraft docked smoothly with the international station." },
  { domain: "space", text: "Mission commanders monitored life support systems constantly." },
  { domain: "space", text: "The commander saluted before boarding the shuttle." },
  { domain: "space", text: "Stars twinkled brightly as the spaceship accelerated faster." },

  // Ocean (12)
  { domain: "ocean", text: "Schools of colorful fish swam gracefully through the coral reef." },
  { domain: "ocean", text: "The giant whale breached the surface of the blue waves." },
  { domain: "ocean", text: "A rusty pirate ship rested quietly on the deep seabed." },
  { domain: "ocean", text: "Divers explored the mysterious underwater shipwreck." },
  { domain: "ocean", text: "The submarine dived deep beneath the crashing waves." },
  { domain: "ocean", text: "Crabs scuttled across the sandy ocean floor near rocks." },
  { domain: "ocean", text: "Hydrothermal vents glowed warmly in the pitch-black abyss." },
  { domain: "ocean", text: "The sailor cast his fishing net into the calm bay." },
  { domain: "ocean", text: "Giant octopuses glided silently through dark kelp forests." },
  { domain: "ocean", text: "Dolphins leaped joyfully beside the sailing ship." },
  { domain: "ocean", text: "Waves crashed heavily against the rocky coastal cliffs." },
  { domain: "ocean", text: "The storm tossed the cargo ship violently across the sea." }
];

console.log("=== VERB CHECK SCRIPT (History, Space, Ocean) ===");
let mappedCount = 0;
let unmappedCount = 0;
const unmapped = [];

for (const item of sentences) {
  const verb = verbFromText(item.text);
  if (verb) {
    mappedCount++;
    console.log(`[${item.domain.toUpperCase()}] "${item.text}" -> ${verb}`);
  } else {
    unmappedCount++;
    unmapped.push(item);
    console.log(`[${item.domain.toUpperCase()}] "${item.text}" -> UNMAPPED (null)`);
  }
}

console.log("\n================ SUMMARY ================");
console.log(`Total sentences: ${sentences.length}`);
console.log(`Mapped: ${mappedCount}`);
console.log(`Unmapped: ${unmappedCount}`);

if (unmapped.length > 0) {
  console.log("\nUnmapped sentences:");
  unmapped.forEach(u => console.log(`- [${u.domain}] ${u.text}`));
} else {
  console.log("\nAll sentences successfully mapped!");
}
