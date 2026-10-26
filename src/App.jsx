import { useState, useEffect, useRef } from "react";
import logo from "./assets/Photo/Logo/logo.png";

// ─── BRAND COLORS (from PowerPoint) ──────────────────────────────────────────
// #000000 — background (black)
// #D91F26 — primary accent (red)
// #FFFFFF — primary text (white)
// #CCCCCC — secondary text (light grey)
// #999999 — muted text (mid grey)

// ─── IMAGE PATH HELPERS ───────────────────────────────────────────────────────
// Item photos live in /public/foods/. Filenames were originally generated from the
// old item names, so many items were renamed to match the official menu but their
// photos may still use the old name. Resolution order for each item:
//   1. item.imageSlugs  (explicit mapping for renamed / ambiguous items)
//   2. slug generated from item.name
// Each slug is tried with .jpg, .jpeg, .png, .webp (and a Capitalized-Words variant
// of the generated slug). If nothing loads, /foods/default.jpg is tried once, then a
// local emoji placeholder is shown — so a missing file can never cause an error loop.
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const DEFAULT_IMAGE = "/foods/default.jpg";

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")          // & → and
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars (keep hyphens)
    .trim()
    .replace(/\s+/g, "-");         // spaces → hyphens

const capitalizedSlug = (name) =>
  name
    .replace(/&/g, "and")
    .replace(/[^A-Za-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");

// Ordered list of candidate image URLs for an item.
const getImageCandidates = (item) => {
  const slugs = [...(item.imageSlugs || []), slugify(item.name)];
  const caps = capitalizedSlug(item.name);
  if (caps && !slugs.includes(caps)) slugs.push(caps);
  const urls = [];
  slugs.forEach((s) => IMAGE_EXTENSIONS.forEach((ext) => urls.push(`/foods/${s}.${ext}`)));
  return [...new Set(urls)];
};

// ─── PRICE HELPERS ────────────────────────────────────────────────────────────
// Backward compatible: an item may have
//   prices: [{ price: 70 }, { price: 100 }]   (new — one or more prices, optional label)
//   price:  "120"                              (legacy single price, string or number)
// Size labels are intentionally omitted until the restaurant confirms which price
// belongs to which size; multiple prices are shown neutrally as "EGP 70 / 100".
const toValidPrice = (v) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const getPriceList = (item) => {
  if (Array.isArray(item.prices)) {
    return item.prices
      .map((p) => ({ label: p.label, price: toValidPrice(p.price) }))
      .filter((p) => p.price !== null);
  }
  const single = toValidPrice(item.price);
  return single !== null ? [{ price: single }] : [];
};

const formatPrice = (item) => {
  const list = getPriceList(item);
  if (list.length === 0) return null;
  const labelled = list.every((p) => p.label);
  const text = list.map((p) => (labelled ? `${p.label} ${p.price}` : `${p.price}`)).join(" / ");
  return `EGP ${text}`;
};

// ─── GLASS (iOS-style frosted look) ───────────────────────────────────────────
const blur = (px) => ({ backdropFilter: `blur(${px}px) saturate(180%)`, WebkitBackdropFilter: `blur(${px}px) saturate(180%)` });
const GLASS_BORDER = "1px solid rgba(255,255,255,0.16)";
const GLASS_HIGHLIGHT = "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(255,255,255,0.05)";

// Shorthand for the menu data below: P(70, 100) → [{price:70},{price:100}]
const P = (...nums) => nums.map((price) => ({ price }));

// Category images (card + banner). Must have one entry per category id in MENU_DATA.
// NOTE: salad / hot-drinks / desserts reuse existing images until dedicated ones are supplied.
const IMG_HEALTHY = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80";
const IMG_FRAPPES = "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80";
const IMG_SHAKES  = "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80";
const CATEGORY_IMAGES = {
  pasta:          "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80",
  pizza:          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
  sandwiches:     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  healthy:        IMG_HEALTHY,
  salad:          IMG_HEALTHY,
  chips:          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
  boba:           "https://images.unsplash.com/photo-1543253687-c931c8e01820?w=800&q=80",
  "iced-drinks":  "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=800&q=80",
  "hot-drinks":   IMG_FRAPPES,
  "fresh-juice":  "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
  smoothies:      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80",
  milkshakes:     IMG_SHAKES,
  desserts:       IMG_SHAKES,
};

// ─── DATA ────────────────────────────────────────────────────────────────────
// Prices are in EGP. Source: official printed menu.
const MENU_DATA = {
  categories: [
    {
      id: "pizza",
      name: "Pizza",
      tagline: "Hand-Tossed, Stone Baked",
      emoji: "🍕",
      items: [
        { name: "Margherita",    desc: "Classic tomato, fresh mozzarella, basil, extra-virgin olive oil.", prices: P(120) },
        { name: "Chicken BBQ",   desc: "Grilled chicken, red onion, mozzarella, smoky BBQ sauce.", prices: P(180) },
        { name: "Tuna",          desc: "Tuna flakes, red onion, olives, mozzarella, tomato sauce.", prices: P(150) },
        { name: "Chicken Ranch", desc: "Grilled chicken, ranch sauce, mushrooms, mozzarella, herbs.", prices: P(190) },
        { name: "Shrimp",        desc: "Garlic shrimp, mozzarella, fresh herbs, white sauce.", prices: P(230) },
        { name: "Vegetables",    imageSlugs: ["vegetable"], desc: "Bell peppers, mushrooms, onion, olives, mozzarella, tomato.", prices: P(145) },
        { name: "Super Supreme", desc: "Pepperoni, beef, peppers, mushrooms, onion, olives.", prices: P(180) },
        { name: "Mix Cheese",    desc: "Blend of four cheeses — mozzarella, cheddar, parmesan, feta.", prices: P(170) },
        { name: "Pepperoni",     desc: "Classic pepperoni, mozzarella, tomato sauce, oregano.", prices: P(170) },
      ]
    },
    {
      id: "pasta",
      name: "Pasta",
      tagline: "Handmade Italian Classics",
      emoji: "🍝",
      items: [
        { name: "California Pasta",    desc: "Our signature house pasta with mixed vegetables and herbs.", prices: P(220) },
        { name: "Texas Alfredo Pasta", imageSlugs: ["texas-alfredo"], desc: "Fettuccine in rich creamy white sauce with grilled chicken, mushrooms & parmesan, served with garlic bread.", prices: P(130) },
        { name: "Arrabbiata Pasta",    imageSlugs: ["arrabiatta-pasta"], desc: "Spicy red tomato sauce with chilli peppers, garlic and fresh basil.", prices: P(90) },
        { name: "Shrimp Pasta",        desc: "Delicious shrimp in a rich rose sauce with parmesan.", prices: P(210) },
        { name: "Spicy Chicken Ranch", desc: "Grilled chicken in creamy ranch sauce with a spicy kick.", prices: P(135) },
        { name: "Spaghetti Bolognese", desc: "Classic pasta with rich beef Bolognese sauce.", prices: P(140) },
        { name: "Nigresco Pasta",      desc: "Black squid-ink pasta with a seafood medley.", prices: P(140) },
        { name: "Shrimp Nigresco Pasta", desc: "Shrimp Nigresco pasta.", prices: P(250) },
        { name: "Mac & Cheese Pasta",   desc: "Mac & Cheese pasta.", prices: P(120) },
        { name: "Pesto Chicken Pasta", imageSlugs: ["pesto-chicken"], desc: "Grilled chicken in fresh basil pesto sauce.", prices: P(150) },
      ]
    },
    {
      id: "sandwiches",
      name: "Sandwiches",
      tagline: "Flame Grilled",
      emoji: "🍔",
      items: [
        { name: "Classic Burger",   desc: "Beef patty, lettuce, tomato, pickles, classic sauce, served with fries.", prices: P(150) },
        { name: "Cheese Burger",    desc: "Beef patty, melted cheddar, lettuce, tomato, pickles, served with fries.", prices: P(170) },
        { name: "California Burger",imageSlugs: ["california-premium"], desc: "Double beef, double cheese, caramelized onion, signature sauce, fries.", prices: P(190) },
        { name: "Double Decker",    desc: "A double-layered burger from our sandwich menu.", prices: P(220) },
        { name: "Chicken Crispy",   desc: "Crispy fried chicken, lettuce, pickles, ranch, served with fries.", prices: P(140) },
      ]
    },
    {
      id: "chips",
      name: "Chips",
      tagline: "Crispy. Golden. Irresistible.",
      emoji: "🍟",
      items: [
        { name: "Original Chips", desc: "Seasoned crispy fries served with two signature dipping sauces.", prices: P(40) },
        { name: "Chicken Chips",  desc: "Crispy chicken strips with seasoned fries and assorted sauces.", prices: P(70) },
        { name: "Fish & Chips",   desc: "Beer-battered cod fillet with golden fries and tartar sauce.", prices: P(60) },
        { name: "Kid's Meal",     desc: "A kid-sized meal from our chips menu.", prices: P(70) },
      ]
    },
    {
      id: "healthy",
      name: "Healthy Corner",
      tagline: "Grilled Fresh, Served Right",
      emoji: "🥗",
      items: [
        { name: "Herb Grilled Chicken", desc: "Marinated chicken breast, fresh herbs, olive oil, grilled to perfection.", prices: P(160) },
        { name: "Chicken & Shrimp",     imageSlugs: ["chicken-and-shrimps"], desc: "Grilled chicken and jumbo shrimp with garlic butter sauce.", prices: P(220) },
        { name: "Shish Tawook",         desc: "Grilled chicken shish tawook.", prices: P(160) },
        { name: "Grilled Beef Steak",   desc: "Grilled beef steak.", prices: P(240) },
      ]
    },
    {
      id: "salad",
      name: "Salad & Soup",
      tagline: "Fresh & Warm",
      emoji: "🥬",
      items: [
        { name: "Caesar Salad",  desc: "A classic Caesar salad.", prices: P(80) },
        { name: "Greek Salad",   desc: "A classic Greek salad.", prices: P(65) },
        { name: "Tuna Salad",    desc: "A fresh tuna salad.", prices: P(120) },
        { name: "Avocado Salad", desc: "A fresh avocado salad.", prices: P(100) },
        { name: "Seafood Soup",  desc: "Seafood soup.", prices: P(250) },
      ]
    },
    {
      id: "boba",
      name: "Boba & Bubbles",
      tagline: "Sparkling & Vibrant",
      emoji: "🫧",
      items: [
        { name: "Pink Boba",         imageSlugs: ["pink-popa"], desc: "A fruity pink boba drink served over ice.", prices: P(125) },
        { name: "Brown Sugar Boba",  desc: "A brown sugar boba drink.", prices: P(140) },
        { name: "Mixed Berry Boba",  imageSlugs: ["mix-berry-popa"], desc: "A mixed berry boba drink served over ice.", prices: P(140) },
        { name: "Mango Passion Boba",imageSlugs: ["mango-passion-popa"], desc: "A mango and passion fruit boba drink served over ice.", prices: P(145) },
      ]
    },
    {
      id: "iced-drinks",
      name: "Iced Drinks",
      tagline: "Chilled. Refreshing. Signature.",
      emoji: "🧊",
      items: [
        { name: "Mojito",                  desc: "Classic mint and lemon mojito with crushed ice and a splash of soda.", prices: P(80) },
        { name: "Mojito with Flavor",      imageSlugs: ["mojito-flavor"], desc: "Choose your favorite fruit flavor blended into a refreshing mojito.", prices: P(90) },
        { name: "Iced Latte",              imageSlugs: ["ice-latte"], desc: "Smooth espresso poured over ice and cold milk.", prices: P(100) },
        { name: "Iced Mocha",              imageSlugs: ["ice-mocha"], desc: "Rich chocolate and espresso blend with ice and cold milk.", prices: P(140) },
        { name: "Americano",               imageSlugs: ["ice-americano"], desc: "Strong espresso shots topped with cold water and ice.", prices: P(80) },
        { name: "White Mocha",             imageSlugs: ["ice-white-mocha"], desc: "Creamy white chocolate with espresso, served over ice.", prices: P(145) },
        { name: "Spanish Latte",           imageSlugs: ["ice-spanish-latte"], desc: "Velvety condensed milk with espresso poured over ice.", prices: P(120) },
        { name: "Salted Caramel Latte",    imageSlugs: ["ice-salted-caramel-latte"], desc: "Salted caramel syrup with espresso and cold milk poured over ice.", prices: P(140) },
        { name: "Iced Caramel Latte",      imageSlugs: ["ice-caramel-latte"], desc: "Buttery caramel with espresso and cold milk over ice.", prices: P(120) },
        { name: "Frappuccino",    desc: "Signature iced coffee blended with milk, ice and topped with whipped cream.", prices: P(110) },
        { name: "Frappe Vanilla", desc: "Creamy vanilla frappuccino blended with milk, ice and a swirl of whipped cream.", prices: P(120) },
        { name: "Frappe Mocha",   desc: "Iced mocha blended with espresso, chocolate and whipped cream.", prices: P(130) },
      ]
    },
    {
      id: "hot-drinks",
      name: "Hot Drinks",
      tagline: "Warm & Comforting",
      emoji: "☕",
      items: [
        { name: "Espresso",       desc: "Classic espresso.", prices: P(50) },
        { name: "Cappuccino",     desc: "Classic cappuccino.", prices: P(90) },
        { name: "Latte",          desc: "Classic hot latte.", prices: P(90) },
        { name: "Spanish Latte",  imageSlugs: ["hot-spanish-latte"], desc: "Hot Spanish latte.", prices: P(110) },
        { name: "Cortado",        desc: "Classic cortado.", prices: P(70) },
        { name: "Turkish Coffee", desc: "Traditional Turkish coffee.", prices: P(35) },
        { name: "Hot Chocolate",  desc: "Hot chocolate.", prices: P(80) },
      ]
    },
    {
      id: "fresh-juice",
      name: "Fresh Juice",
      tagline: "Cold-Pressed, Naturally Sweet",
      emoji: "🍊",
      items: [
        { name: "Kiwi",       imageSlugs: ["kiwi-juice"], desc: "Vibrant kiwi juice with a tangy flavor and bright green color.", prices: P(90, 110) },
        { name: "Mango",      imageSlugs: ["mango-juice"], desc: "Velvety mango juice bursting with tropical sweetness.", prices: P(50, 90) },
        { name: "Strawberry", imageSlugs: ["strawberry-juice"], desc: "Lush strawberry blend with a touch of natural sweetness.", prices: P(50, 85) },
        { name: "Guava",      imageSlugs: ["guava-juice"], desc: "Tropical guava juice with a smooth, fragrant flavor.", prices: P(50, 85) },
        { name: "Orange",     imageSlugs: ["orange-juice"], desc: "Fresh orange juice with a refreshing citrus flavor.", prices: P(50, 85) },
        { name: "Banana",     imageSlugs: ["banana-juice"], desc: "Creamy banana juice, smooth and naturally sweet.", prices: P(50, 85) },
        { name: "Lemon",      imageSlugs: ["lemon-juice"], desc: "Refreshing lemon juice with a tangy bite and crisp finish.", prices: P(50, 85) },
        { name: "Lemon Mint", imageSlugs: ["lemon-mint-juice"], desc: "Cold lemon and fresh mint — incredibly refreshing.", prices: P(50, 85) },
      ]
    },
    {
      id: "smoothies",
      name: "Smoothies",
      tagline: "Blended Fresh Fruit, Thick and Creamy",
      emoji: "🥤",
      items: [
        { name: "Watermelon", imageSlugs: ["watermelon-smoothie"], desc: "Cold blended watermelon — refreshing and hydrating.", prices: P(60, 110) },
        { name: "Kiwi",       imageSlugs: ["kiwi-smoothie"], desc: "Fresh kiwi blend with a tangy flavor, thick and smooth.", prices: P(60, 110) },
        { name: "Mango",      imageSlugs: ["mango-smoothie"], desc: "Rich golden mango blended with cream.", prices: P(60, 110) },
        { name: "Strawberry", imageSlugs: ["strawberry-smoothie"], desc: "Ripe sweet strawberries blended fresh.", prices: P(60, 110) },
        { name: "Guava",      imageSlugs: ["guava-smoothie"], desc: "Thick and fragrant tropical guava blend.", prices: P(60, 110) },
        { name: "Orange",     imageSlugs: ["orange-smoothie"], desc: "Fresh oranges with a creamy blended taste.", prices: P(60, 110) },
        { name: "Banana",     imageSlugs: ["banana-smoothie"], desc: "Ripe creamy banana blended thick and smooth.", prices: P(60, 110) },
        { name: "Lemon",      imageSlugs: ["lemon-smoothie"], desc: "Refreshing lemon blended cold.", prices: P(60, 110) },
        { name: "Lemon Mint", imageSlugs: ["lemon-mint-smoothie"], desc: "Cold lemon and fresh mint blended together.", prices: P(60, 110) },
      ]
    },
    {
      id: "milkshakes",
      name: "Milk Shakes",
      tagline: "Classic Creamy Blends",
      emoji: "🍦",
      items: [
        // "Carmel Shake" spelling follows the supplied menu — confirm with owner.
        { name: "Vanilla Shake",   desc: "Classic creamy vanilla milkshake blended with rich ice cream and cold milk.", prices: P(95) },
        { name: "Carmel Shake",    imageSlugs: ["caramel-shake"], desc: "Butter caramel blended with vanilla ice cream, topped with golden caramel sauce.", prices: P(95) },
        { name: "Chocolate Shake", desc: "Rich chocolate milkshake blended with cocoa, ice cream and chocolate drizzle.", prices: P(95) },
        { name: "Mango Shake",     desc: "Tropical mango blend with creamy ice cream for a smooth fruity treat.", prices: P(95) },
        { name: "Strawberry Shake",desc: "Fresh strawberries blended with vanilla ice cream and a touch of milk.", prices: P(95) },
        { name: "Oreo Shake",      desc: "Crushed Oreos blended with vanilla ice cream, topped with whipped cream.", prices: P(110) },
      ]
    },
    {
      id: "desserts",
      name: "Desserts",
      tagline: "Sweet Endings",
      emoji: "🍰",
      items: [
        { name: "Nutella Pizza",             desc: "A sweet dessert pizza with Nutella.", prices: P(75) },
        { name: "Molten Cake",               desc: "A warm molten cake.", prices: P(75) },
        { name: "Cheese Cake",               desc: "A classic cheesecake.", prices: P(60) },
        { name: "Waffle (Carmel, Chocolate)",desc: "Waffle with Carmel or Chocolate.", prices: P(75) },
        { name: "Waffle (Lotus, Pistachio)", desc: "Waffle with Lotus or Pistachio.", prices: P(95) },
      ]
    },
  ]
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = ({ size = 250 }) => (
  <img
    src={logo}
    alt="California Cuisine"
    style={{ width: size, height: size, objectFit: "contain" }}
  />
);

// ─── SPLASH ────────────────────────────────────────────────────────────────────
// Same look as the rest of the app: red ambient glow on black, frosted glass panel.
// Exit is a morph: the glass panel grows until it fills the screen (its corners
// straighten as it grows) while the menu is revealed behind and through it, then
// the panel fades away.
//   in → visible → glow → expand (panel grows, menu mounts) → out (fade) → done
function SplashScreen({ onReveal, onDone }) {
  const [phase, setPhase] = useState("in");
  const [box, setBox] = useState(null);     // panel's rect at the moment it starts growing
  const [grown, setGrown] = useState(false);
  const panelRef = useRef(null);
  const cb = useRef({ onReveal, onDone });
  cb.current = { onReveal, onDone };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 100);
    const t2 = setTimeout(() => setPhase("glow"),    600);
    const t3 = setTimeout(() => { setPhase("expand"); cb.current.onReveal(); }, 2300);
    const t4 = setTimeout(() => setPhase("out"),    3050);
    const t5 = setTimeout(() => cb.current.onDone(), 3550);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  // measure the panel, pin it at that size, then let it grow to the full screen
  useEffect(() => {
    if (phase !== "expand" || !panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    let raf2;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setGrown(true)); });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [phase]);

  const expanding = box !== null;
  const geometry = !expanding ? {} : grown
    ? { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", maxWidth: "none", borderRadius: 0 }
    : { position: "absolute", top: box.top, left: box.left, width: box.width, height: box.height, maxWidth: "none" };
  const MORPH = "0.75s cubic-bezier(0.32,0.72,0,1)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: phase === "out" ? 0 : 1,
      transition: phase === "out" ? "opacity 0.5s ease" : "none",
      pointerEvents: phase === "out" ? "none" : "auto",
    }}>
      {/* Backdrop: fades away as the panel grows so the menu shows through the glass */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 12% 8%, rgba(217,31,38,0.30) 0%, transparent 42%), radial-gradient(circle at 90% 55%, rgba(217,31,38,0.18) 0%, transparent 45%), radial-gradient(circle at 20% 95%, rgba(255,255,255,0.07) 0%, transparent 40%), #000000",
        opacity: expanding ? 0 : 1,
        transition: "opacity 0.6s ease",
      }} />

      {/* Red glow behind the panel (kept separate so the glass can blur it) */}
      <div style={{
        position: "absolute", width: 360, height: 360, maxWidth: "90vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(217,31,38,0.55) 0%, transparent 70%)",
        opacity: phase === "glow" ? 1 : 0,
        transition: "opacity 0.9s ease",
        pointerEvents: "none",
      }} />

      <div
        ref={panelRef}
        className="glass"
        style={{
          position: "relative",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "32px clamp(24px,8vw,48px) 36px",
          maxWidth: "calc(100% - 32px)",
          borderRadius: 32,
          background: "rgba(255,255,255,0.07)", ...blur(24),
          border: GLASS_BORDER,
          boxShadow: `${GLASS_HIGHLIGHT}, 0 16px 48px rgba(0,0,0,0.55)`,
          transform: phase === "in" ? "scale(0.82)" : "scale(1)",
          opacity: phase === "in" ? 0 : 1,
          transition: expanding
            ? `top ${MORPH}, left ${MORPH}, width ${MORPH}, height ${MORPH}, border-radius ${MORPH}`
            : "transform 0.9s cubic-bezier(0.34,1.56,0.64,1), opacity 0.9s ease",
          ...geometry,
        }}
      >
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
          opacity: expanding ? 0 : 1,
          transform: expanding ? "scale(0.94)" : "scale(1)",
          transition: "opacity 0.3s ease, transform 0.4s ease",
        }}>
          <Logo size={170} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#D91F26", fontFamily: "Georgia,serif", letterSpacing: "clamp(4px,3vw,10px)", fontSize: "clamp(11px,3.5vw,13px)", marginBottom: 6 }}>
              CALIFORNIA
            </div>
            <div style={{ color: "#FFFFFF", fontFamily: "Georgia,serif", letterSpacing: "clamp(4px,4vw,14px)", fontSize: "clamp(18px,6vw,24px)", fontWeight: "bold" }}>
              C U I S I N E
            </div>
            <div style={{ width: 80, height: 3, borderRadius: 2, background: "#D91F26", margin: "14px auto" }} />
            <div style={{ color: "#CCCCCC", fontFamily: "Georgia,serif", letterSpacing: "clamp(3px,2.5vw,8px)", fontSize: "clamp(11px,2.8vw,12px)" }}>
              THE MENU
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LAZY IMAGE with fade-in and safe fallback chain ──────────────────────────
// Tries each candidate URL in order, then DEFAULT_IMAGE once, then shows a local
// emoji placeholder. Every step moves forward only, so there is no error loop.
function LazyImage({ candidates, alt, placeholder, style, imgStyle }) {
  const [loaded, setLoaded] = useState(false);
  const [idx, setIdx] = useState(0);

  const sources = [...candidates, DEFAULT_IMAGE];
  const failed = idx >= sources.length;

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      {failed ? (
        <div
          role="img"
          aria-label={alt}
          style={{
            width: "100%", height: "100%", background: "#000000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(40px,12vw,64px)", opacity: 0.55,
          }}
        >
          {placeholder}
        </div>
      ) : (
        <img
          key={sources[idx]}
          src={sources[idx]}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setIdx((i) => i + 1)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center center",
            display: "block",
            background: "#000000",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease",
            ...imgStyle,
          }}
        />
      )}
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
// One continuous page: hero → browse → food → drinks & sweets → closing call-to-action.
// Liquid Glass is used for the floating navigation and the card surfaces; text always sits
// on a dark, mostly opaque layer so names, descriptions and prices stay readable.
const ACCENT = {
  pizza: "#FF6B35", pasta: "#FFB347", sandwiches: "#E8553D", chips: "#FFD23F",
  healthy: "#6FCF6F", salad: "#8BD97F", boba: "#FF7EB6", "iced-drinks": "#4CC9F0",
  "hot-drinks": "#D69A62", "fresh-juice": "#FF9F1C", smoothies: "#EF476F",
  milkshakes: "#F6A6C8", desserts: "#C89BFF",
};
const KITCHEN_IDS = ["pizza", "pasta", "sandwiches", "chips", "healthy", "salad"];
const GROUPS = [
  { eyebrow: "From the Kitchen", ids: KITCHEN_IDS },
  { eyebrow: "Drinks & Sweets",  ids: null }, // everything else
];

const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: on ? 1 : 0, transform: on ? "none" : "translateY(22px)",
      transition: `opacity .7s ease ${delay}ms, transform .8s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>{children}</div>
  );
}

function ItemCard({ item, category }) {
  const priceText = formatPrice(item);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <article className="card glass" onPointerMove={onMove}>
      <div className="card-img">
        <LazyImage
          key={`${category.id}-${item.name}`}
          candidates={getImageCandidates(item)}
          alt={item.name}
          placeholder={category.emoji}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="card-body">
        <h3>{item.name}</h3>
        <p>{item.desc}</p>
        {priceText && <span className="price">{priceText}</span>}
      </div>
    </article>
  );
}

function Section({ category }) {
  return (
    <section id={category.id} className="sec" style={{ "--accent": ACCENT[category.id] || "#D91F26" }}>
      <Reveal className="sec-head">
        <div className="sec-glow" aria-hidden="true" />
        <span className="sec-count">{category.items.length} items</span>
        <h2>{category.name}</h2>
        <div className="sec-bar" />
        <p>{category.tagline}</p>
      </Reveal>
      <div className="grid">
        {category.items.map((item, i) => (
          <Reveal key={`${category.id}-${item.name}`} delay={(i % 3) * 70}>
            <ItemCard item={item} category={category} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TopNav({ activeId, visible }) {
  const rowRef = useRef(null);
  useEffect(() => {
    const row = rowRef.current, el = row && row.querySelector(`[data-id="${activeId}"]`);
    if (row && el) row.scrollTo({ left: el.offsetLeft - row.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
  }, [activeId]);
  return (
    <nav className={`topnav glass ${visible ? "show" : ""}`} aria-label="Menu categories" aria-hidden={!visible}>
      <button className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" tabIndex={visible ? 0 : -1}>
        <img src={logo} alt="" />
      </button>
      <div className="chips" ref={rowRef}>
        {MENU_DATA.categories.map((c) => (
          <button key={c.id} data-id={c.id} tabIndex={visible ? 0 : -1}
            className={`chip ${activeId === c.id ? "on" : ""}`}
            aria-current={activeId === c.id ? "true" : undefined}
            onClick={() => goTo(c.id)}>{c.name}</button>
        ))}
      </div>
    </nav>
  );
}

function Landing() {
  const [activeId, setActiveId] = useState(MENU_DATA.categories[0].id);
  const [navVisible, setNavVisible] = useState(false);
  const heroImg = useRef(null);
  const cats = MENU_DATA.categories;
  const totalItems = cats.reduce((n, c) => n + c.items.length, 0);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // nav appears after the hero; hero photo drifts slower than the page (parallax)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavVisible(y > window.innerHeight * 0.55);
      if (heroImg.current && y < window.innerHeight * 1.2) heroImg.current.style.transform = `translate3d(0, ${y * 0.22}px, 0) scale(1.08)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll-spy: highlight the chip of the section in view
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
    }, { rootMargin: "-35% 0px -60% 0px" });
    cats.forEach((c) => { const el = document.getElementById(c.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [cats]);

  return (
    <>
      <TopNav activeId={activeId} visible={navVisible} />

      {/* HERO */}
      <header className="hero">
        <img ref={heroImg} className="hero-img" src={CATEGORY_IMAGES.pizza} alt="" onError={(e) => { e.target.style.display = "none"; }} />
        <div className="hero-shade" />
        <div className="hero-inner">
          <Logo size={170} />
          <div className="kicker">CALIFORNIA CUISINE</div>
          <h1>Taste<br />California.</h1>
          <p>Pizza, pasta, burgers, fresh juices, shakes and desserts, all in one menu.</p>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => goTo("browse")}>Explore the menu</button>
            <button className="btn glass" onClick={() => goTo("boba")}>Drinks &amp; sweets</button>
          </div>
          <div className="hero-stats">
            <span className="glass">{cats.length} categories</span>
            <span className="glass">{totalItems} dishes &amp; drinks</span>
            <span className="glass">Prices in EGP</span>
          </div>
        </div>
        <button className="scroll-cue glass" onClick={() => goTo("browse")} aria-label="Scroll to menu">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </header>

      {/* BROWSE */}
      <section id="browse" className="browse">
        <Reveal className="browse-head">
          <div className="kicker">THE MENU</div>
          <h2>Pick your craving</h2>
        </Reveal>
        <div className="tiles">
          {cats.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 60}>
              <button className="tile" style={{ "--accent": ACCENT[c.id] }} onClick={() => goTo(c.id)} aria-label={`${c.name}, ${c.items.length} items`}>
                <img src={CATEGORY_IMAGES[c.id]} alt="" loading="lazy" onError={(e) => { e.target.style.display = "none"; }} />
                <span className="tile-label glass"><b>{c.name}</b><i>{c.items.length}</i></span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MENU SECTIONS */}
      {GROUPS.map((g) => {
        const list = cats.filter((c) => (g.ids ? g.ids.includes(c.id) : !KITCHEN_IDS.includes(c.id)));
        return (
          <div key={g.eyebrow}>
            <Reveal className="group"><div className="kicker">{g.eyebrow.toUpperCase()}</div></Reveal>
            {list.map((c) => <Section key={c.id} category={c} />)}
          </div>
        );
      })}

      {/* CLOSING CTA */}
      <section className="cta">
        <Reveal>
          <div className="cta-panel glass">
            <Logo size={64} />
            <h2>Found your favorite?</h2>
            <p>Let your server know what you’d like, and we’ll take it from there.</p>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</button>
              <button className="btn glass" onClick={() => goTo("browse")}>Browse categories</button>
            </div>
          </div>
        </Reveal>
        <div className="foot">EST. CALIFORNIA CUISINE</div>
      </section>
    </>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; touch-action: manipulation; }
body { background: #000; -webkit-tap-highlight-color: transparent; padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }
button { font: inherit; color: inherit; -webkit-appearance: none; touch-action: manipulation; cursor: pointer; background: none; border: 0; }
img { -webkit-user-drag: none; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #000; } ::-webkit-scrollbar-thumb { background: #D91F26; border-radius: 2px; }
button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.glass { background: rgba(255,255,255,0.08); -webkit-backdrop-filter: blur(24px) saturate(180%); backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255,255,255,0.16); box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(255,255,255,0.05); }
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .glass { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; background: #1c1c1e !important; border: 1px solid rgba(255,255,255,0.55) !important; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }
.kicker { color: #D91F26; font: 700 12px/1 system-ui,-apple-system,sans-serif; letter-spacing: .32em; }
h1, h2, h3 { font-family: Georgia, serif; color: #fff; }

/* hero */
.hero { position: relative; min-height: 100svh; display: flex; align-items: center; justify-content: center; overflow: hidden; text-align: center; padding: 96px 20px 80px; }
.hero-img { position: absolute; inset: -4% 0; width: 100%; height: 108%; object-fit: cover; filter: brightness(.55) saturate(1.15); will-change: transform; }
.hero-shade { position: absolute; inset: 0; background: radial-gradient(circle at 20% 15%, rgba(217,31,38,.38), transparent 45%), linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.35) 55%, #000 100%); }
.hero-inner { position: relative; display: flex; flex-direction: column; align-items: center; gap: 18px; max-width: 640px; }
.hero h1 { font-size: clamp(44px, 12vw, 96px); line-height: .98; letter-spacing: -.01em; text-transform: uppercase; text-shadow: 0 6px 40px rgba(0,0,0,.6); }
.hero p { color: #e5e5ea; font: 400 clamp(16px,4vw,19px)/1.5 system-ui,-apple-system,sans-serif; max-width: 480px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 6px; }
.btn { min-height: 48px; padding: 0 26px; border-radius: 999px; color: #fff; font: 600 16px system-ui,-apple-system,sans-serif; transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .25s; }
.btn:active { transform: scale(.96); }
.btn.primary { background: #D91F26; border: 1px solid rgba(255,255,255,.35); box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 10px 30px rgba(217,31,38,.45); }
.hero-stats { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 10px; }
.hero-stats span { padding: 8px 14px; border-radius: 999px; color: #fff; font: 500 13px system-ui,-apple-system,sans-serif; }
.scroll-cue { position: absolute; bottom: 24px; left: 50%; margin-left: -22px; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; animation: bob 2.2s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(6px); } }

/* floating nav */
.topnav { position: fixed; z-index: 100; top: calc(env(safe-area-inset-top) + 10px); left: 10px; right: 10px; max-width: 980px; margin: 0 auto; height: 56px; border-radius: 999px; display: flex; align-items: center; gap: 6px; padding: 6px; background: rgba(24,24,27,.55); transform: translateY(-140%); opacity: 0; transition: transform .55s cubic-bezier(.32,.72,0,1), opacity .4s; box-shadow: inset 0 1px 0 rgba(255,255,255,.28), 0 12px 36px rgba(0,0,0,.5); }
.topnav.show { transform: none; opacity: 1; }
.nav-logo { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.08); }
.nav-logo img { width: 30px; height: 30px; object-fit: contain; }
.chips { display: flex; gap: 6px; overflow-x: auto; flex: 1; scrollbar-width: none; -webkit-mask-image: linear-gradient(to right, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%); mask-image: linear-gradient(to right, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%); }
.chips::-webkit-scrollbar { display: none; }
.chip { flex-shrink: 0; height: 40px; padding: 0 16px; border-radius: 999px; color: #fff; font: 500 14px system-ui,-apple-system,sans-serif; white-space: nowrap; transition: background .3s; }
.chip.on { background: #D91F26; font-weight: 700; box-shadow: inset 0 1px 0 rgba(255,255,255,.35); }

/* browse tiles */
.browse { max-width: 1200px; margin: 0 auto; padding: 56px 14px 24px; scroll-margin-top: 80px; }
.browse-head { text-align: center; margin-bottom: 26px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.browse-head h2 { font-size: clamp(28px, 7vw, 48px); text-transform: uppercase; }
.tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 640px) { .tiles { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
@media (min-width: 960px) { .tiles { grid-template-columns: repeat(4, 1fr); } }
.tile { position: relative; display: block; width: 100%; aspect-ratio: 4/3; border-radius: 24px; overflow: hidden; background: #111; border: 1px solid rgba(255,255,255,.14); transition: transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .3s; }
.tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(.7); transition: transform .6s ease; }
.tile:hover { transform: translateY(-3px); box-shadow: 0 14px 36px color-mix(in srgb, var(--accent) 40%, transparent); }
.tile:hover img { transform: scale(1.06); }
.tile:active { transform: scale(.97); }
.tile-label { position: absolute; left: 8px; right: 8px; bottom: 8px; padding: 10px 12px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; gap: 8px; background: rgba(20,20,22,.5); text-align: left; }
.tile-label b { color: #fff; font: 700 clamp(13px,3.4vw,16px)/1.2 Georgia,serif; text-transform: uppercase; letter-spacing: .3px; }
.tile-label i { font: 600 12px system-ui,sans-serif; color: #fff; font-style: normal; min-width: 24px; text-align: center; padding: 3px 7px; border-radius: 999px; background: var(--accent); color: #111; }

/* sections */
.group { text-align: center; padding: 72px 20px 0; }
.sec { position: relative; max-width: 1200px; margin: 0 auto; padding: 40px 14px 24px; scroll-margin-top: 84px; }
.sec-head { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; margin-bottom: 26px; }
.sec-glow { position: absolute; top: -40px; width: 320px; height: 200px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--accent) 35%, transparent), transparent 70%); filter: blur(10px); pointer-events: none; }
.sec-count { position: relative; color: var(--accent); font: 700 12px system-ui,sans-serif; letter-spacing: .2em; text-transform: uppercase; }
.sec-head h2 { position: relative; font-size: clamp(30px, 8vw, 56px); text-transform: uppercase; letter-spacing: .02em; line-height: 1.05; }
.sec-bar { position: relative; width: 56px; height: 4px; border-radius: 2px; background: var(--accent); }
.sec-head p { position: relative; color: #c7c7cc; font: 400 15px system-ui,-apple-system,sans-serif; }
.grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 561px) { .grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; } }

/* item cards */
.card { --accent: inherit; position: relative; display: flex; flex-direction: row; height: 100%; border-radius: 26px; overflow: hidden; background: rgba(26,26,29,.78); transition: transform .4s cubic-bezier(.34,1.56,.64,1), border-color .3s, box-shadow .3s; }
.card::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .3s; background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(255,255,255,.16), transparent 60%); }
@media (hover: hover) { .card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--accent) 70%, #fff 10%); box-shadow: 0 16px 40px color-mix(in srgb, var(--accent) 25%, transparent), inset 0 1px 0 rgba(255,255,255,.3); } .card:hover::before { opacity: 1; } }
.card-img { flex: 0 0 112px; width: 112px; aspect-ratio: 1; margin: 10px; border-radius: 18px; overflow: hidden; background: #000; }
.card-body { display: flex; flex-direction: column; gap: 6px; padding: 14px 14px 14px 4px; min-width: 0; flex: 1; }
.card h3 { font-size: 15px; text-transform: uppercase; letter-spacing: .3px; line-height: 1.25; }
.card p { color: #d1d1d6; font: 400 13px/1.5 system-ui,-apple-system,sans-serif; }
.price { align-self: flex-start; margin-top: auto; padding: 6px 12px; border-radius: 999px; color: #fff; white-space: nowrap; font: 700 14px Georgia,serif; background: color-mix(in srgb, var(--accent) 30%, #000); border: 1px solid color-mix(in srgb, var(--accent) 80%, transparent); box-shadow: inset 0 1px 0 rgba(255,255,255,.25); }
@media (min-width: 561px) {
  .card { flex-direction: column; }
  .card-img { flex: none; width: auto; margin: 10px 10px 0; }
  .card-body { padding: 14px 16px 18px; }
  .card h3 { font-size: 16px; }
}

/* closing CTA */
.cta { max-width: 760px; margin: 0 auto; padding: 90px 14px 40px; }
.cta-panel { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; padding: 40px 24px; border-radius: 36px; background: radial-gradient(circle at 50% 0%, rgba(217,31,38,.35), rgba(255,255,255,.06) 70%); }
.cta-panel h2 { font-size: clamp(28px, 7vw, 44px); text-transform: uppercase; }
.cta-panel p { color: #e5e5ea; font: 400 17px/1.5 system-ui,-apple-system,sans-serif; max-width: 420px; }
.foot { text-align: center; padding: 36px 0 calc(24px + env(safe-area-inset-bottom)); color: #666; font: 11px Georgia,serif; letter-spacing: 4px; }
`;

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [revealed, setRevealed] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  // the page mounts underneath while the splash panel is still growing
  const handleReveal = () => { setRevealed(true); setTimeout(() => setPageVisible(true), 80); };
  const handleSplashDone = () => { setScreen("menu"); setPageVisible(true); };

  return (
    <div style={{
      minHeight: "100vh", color: "#FFFFFF", overflowX: "clip",
      background: "radial-gradient(circle at 12% 8%, rgba(217,31,38,0.22) 0%, transparent 40%), radial-gradient(circle at 90% 45%, rgba(217,31,38,0.14) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(255,255,255,0.05) 0%, transparent 40%), #000000",
    }}>
      <style>{CSS}</style>
      {screen === "splash" && <SplashScreen onReveal={handleReveal} onDone={handleSplashDone} />}
      {(screen === "menu" || revealed) && (
        <div style={{ opacity: pageVisible ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <Landing />
        </div>
      )}
    </div>
  );
}