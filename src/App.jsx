import { useState, useEffect } from "react";
import logo from "./assets/Photo/Logo/logo.png";

// ─── BRAND COLORS (from PowerPoint) ──────────────────────────────────────────
// #000000 — background (black)
// #D91F26 — primary accent (red)
// #FFFFFF — primary text (white)
// #CCCCCC — secondary text (light grey)
// #999999 — muted text (mid grey)

// ─── DATA ────────────────────────────────────────────────────────────────────
const MENU_DATA = {
   categories: [
    {
      id: "pasta",
      name: "Pasta",
      tagline: "Handmade Italian Classics",
      emoji: "🍝",
      items: [
        { name: "Texas Alfredo", desc: "Fettuccine in rich creamy white sauce with grilled chicken, mushrooms & parmesan, served with garlic bread.", price: "120" },
        { name: "Arrabiatta Pasta", desc: "Spicy red tomato sauce with chilli peppers, garlic and fresh basil.", price: "130" },
        { name: "Shrimp Pasta", desc: "Delicious shrimp in a rich rose sauce with parmesan.", price: "190" },
        { name: "Spicy Chicken Ranch", desc: "Grilled chicken in creamy ranch sauce with a spicy kick.", price: "150" },
        { name: "California Pasta", desc: "Our signature house pasta with mixed vegetables and herbs.", price: "120" },
        { name: "Spaghetti Bolognese", desc: "Classic pasta with rich beef Bolognese sauce.", price: "110" },
        { name: "Mac & Cheese", desc: "Creamy triple-cheese pasta, golden baked.", price: "150" },
        { name: "Nigresco Pasta", desc: "Black squid-ink pasta with a seafood medley.", price: null },
        { name: "Pesto Chicken", desc: "Grilled chicken in fresh basil pesto sauce.", price: "100" },
      ]
    },
    {
      id: "pizza",
      name: "Pizza",
      tagline: "Hand-Tossed, Stone Baked",
      emoji: "🍕",
      items: [
        { name: "Margherita", desc: "Classic tomato, fresh mozzarella, basil, extra-virgin olive oil.", price: "86.99" },
        { name: "Chicken BBQ", desc: "Grilled chicken, red onion, mozzarella, smoky BBQ sauce.", price: "89.99" },
        { name: "Tuna", desc: "Tuna flakes, red onion, olives, mozzarella, tomato sauce.", price: "86.99" },
        { name: "Chicken Ranch", desc: "Grilled chicken, ranch sauce, mushrooms, mozzarella, herbs.", price: "89.99" },
        { name: "Shrimp", desc: "Garlic shrimp, mozzarella, fresh herbs, white sauce.", price: "119.90" },
        { name: "Vegetable", desc: "Bell peppers, mushrooms, onion, olives, mozzarella, tomato.", price: "79.00" },
        { name: "Super Supreme", desc: "Pepperoni, beef, peppers, mushrooms, onion, olives.", price: "94.99" },
        { name: "Mix Cheese", desc: "Blend of four cheeses — mozzarella, cheddar, parmesan, feta.", price: "82.99" },
        { name: "Pepperoni", desc: "Classic pepperoni, mozzarella, tomato sauce, oregano.", price: "96.99" },
      ]
    },
    {
      id: "burgers",
      name: "Burgers & Sandwiches",
      tagline: "Flame Grilled",
      emoji: "🍔",
      items: [
        { name: "Classic Burger", desc: "Beef patty, lettuce, tomato, pickles, classic sauce, served with fries.", price: "135" },
        { name: "Cheese Burger", desc: "Beef patty, melted cheddar, lettuce, tomato, pickles, served with fries.", price: "89.99" },
        { name: "California Premium", desc: "Double beef, double cheese, caramelized onion, signature sauce, fries.", price: "94.99" },
        { name: "Spicy Burger", desc: "Beef patty, jalapeños, pepper jack, spicy mayo, served with fries.", price: "84.99" },
        { name: "Chicken Crispy", desc: "Crispy fried chicken, lettuce, pickles, ranch, served with fries.", price: "79.99" },
      ]
    },
    {
      id: "healthy",
      name: "Healthy Corner",
      tagline: "Grilled Fresh, Served Right",
      emoji: "🥗",
      items: [
        { name: "Herb Grilled Chicken", desc: "Marinated chicken breast, fresh herbs, olive oil, grilled to perfection.", price: "124.99" },
        { name: "Chicken & Shrimps", desc: "Grilled chicken and jumbo shrimp with garlic butter sauce.", price: "159.99" },
        { name: "Grilled Salmon", desc: "Atlantic salmon fillet, lemon butter, fresh herbs.", price: "189.99" },
        { name: "Fillet Grilled", desc: "Premium beef, pepper sauce, grilled vegetables.", price: "219.99" },
      ]
    },
    {
      id: "chips",
      name: "Chips Corner",
      tagline: "Crispy. Golden. Irresistible.",
      emoji: "🍟",
      items: [
        { name: "Original Chips", desc: "Seasoned crispy fries served with two signature dipping sauces.", price: "22.99" },
        { name: "Chicken Chips", desc: "Crispy chicken strips with seasoned fries and assorted sauces.", price: "22.99" },
        { name: "Fish & Chips", desc: "Beer-battered cod fillet with golden fries and tartar sauce.", price: "19.99" },
        { name: "Tix Mix Chips", desc: "Loaded fries stuffed with chicken, cheese sauce and premium toppings.", price: "22.99" },
      ]
    },
    {
      id: "kids",
      name: "Kids Meals",
      tagline: "Small. Great. Fun.",
      emoji: "🧒",
      items: [
        { name: "Spaghetti Bolognese", desc: "Small portion of spaghetti mixed with rich beef Bolognese, topped with parmesan.", price: null },
        { name: "Chicken Fingers", desc: "Golden crispy chicken pieces with a side of fries and ketchup.", price: null },
        { name: "Mini Burger", desc: "Small cheeseburger on soft brioche with beef patty, cheddar and pickles.", price: null },
        { name: "Mini Pizza", desc: "Small pizza with tomato, mozzarella and a sprinkle of fresh basil.", price: null },
      ]
    },
    {
      id: "compo",
      name: "Compo Meals",
      tagline: "Shared Feasts for Every Occasion",
      emoji: "🍱",
      items: [
        { name: "Crispy Chicken Compo", desc: "Crispy fried chicken sandwich with fries, coleslaw, and a refreshing Pepsi.", price: null },
        { name: "Mix Compo", desc: "Sharing platter for two: assorted sandwiches, fries, sides, and two Pepsi drinks.", price: null },
        { name: "Family Compo", desc: "Family feast with sandwiches, pizza, fries, sides, and four chilled drinks.", price: null },
        { name: "California Compo", desc: "Perfect sharing experience: sandwiches, pizza, pasta, juices and milkshake for six.", price: null },
      ]
    },
    {
      id: "popa",
      name: "Popa & Pupls",
      tagline: "Sparkling & Vibrant",
      emoji: "🫧",
      items: [
        { name: "Pink Popa", desc: "Sweet fizzy pink cocktail rich with strawberry syrup and crushed ice.", price: "125" },
        { name: "Blue Pupls", desc: "Electric blue sparkling drink with a citrus twist and icy finish.", price: "130" },
        { name: "Mix Berry Popa", desc: "Triple berry blend bubbling over ice — cranberry, blueberry and blackberry.", price: "140" },
        { name: "Mango Passion Popa", desc: "Tropical sparkling mango and passion fruit — golden and refreshing.", price: "150" },
      ]
    },
    {
      id: "ice-drinks",
      name: "Ice Drinks",
      tagline: "Chilled. Refreshing. Signature.",
      emoji: "🧊",
      items: [
        { name: "California Cocktail", desc: "Signature house cocktail with mixed fruit flavors, served over crushed ice.", price: "90" },
        { name: "Mojito", desc: "Classic mint and lemon mojito with crushed ice and a splash of soda.", price: "80" },
        { name: "Mojito Flavor", desc: "Choose your favorite fruit flavor blended into a refreshing mojito.", price: "90" },
        { name: "Ice Latte", desc: "Smooth espresso poured over ice and cold milk.", price: "100" },
        { name: "Ice Mocha", desc: "Rich chocolate and espresso blend with ice and cold milk.", price: "140" },
        { name: "Ice Americano", desc: "Strong espresso shots topped with cold water and ice.", price: "80" },
        { name: "Ice White Mocha", desc: "Creamy white chocolate with espresso, served over ice.", price: "145" },
        { name: "Ice Spanish Latte", desc: "Velvety condensed milk with espresso poured over ice.", price: "120" },
        { name: "Ice Matcha", desc: "Premium green matcha whisked with cold milk over ice.", price: null },
        { name: "Ice Matcha Strawberry", desc: "Vibrant matcha blended with sweet strawberry and cold milk.", price: null },
      ]
    },
    {
      id: "fresh-juice",
      name: "Fresh Juice",
      tagline: "Cold-Pressed, Naturally Sweet",
      emoji: "🍊",
      items: [
        { name: "Watermelon", desc: "Refreshing watermelon juice, freshly squeezed and chilled.", price: "85" },
        { name: "Kiwi", desc: "Vibrant kiwi juice with a tangy flavor and bright green color.", price: "110" },
        { name: "Mango", desc: "Velvety mango juice bursting with tropical sweetness.", price: "90" },
        { name: "Strawberry", desc: "Lush strawberry blend with a touch of natural sweetness.", price: "85" },
        { name: "Guava", desc: "Tropical guava juice with a smooth, fragrant flavor.", price: "85" },
        { name: "Orange", desc: "Fresh orange juice with a refreshing citrus flavor.", price: "85" },
        { name: "Banana", desc: "Creamy banana juice, smooth and naturally sweet.", price: "85" },
        { name: "Lemon", desc: "Refreshing lemon juice with a tangy bite and crisp finish.", price: "85" },
        { name: "Lemon Mint", desc: "Cold lemon and fresh mint — incredibly refreshing.", price: "85" },
      ]
    },
    {
      id: "smoothies",
      name: "Smoothies",
      tagline: "Blended Fresh Fruit, Thick and Creamy",
      emoji: "🥤",
      items: [
        { name: "Watermelon Smoothie", desc: "Cold blended watermelon — refreshing and hydrating.", price: "130" },
        { name: "Kiwi Smoothie", desc: "Fresh kiwi blend with a tangy flavor, thick and smooth.", price: "130" },
        { name: "Mango Smoothie", desc: "Rich golden mango blended with cream.", price: "130" },
        { name: "Strawberry Smoothie", desc: "Ripe sweet strawberries blended fresh.", price: "130" },
        { name: "Guava Smoothie", desc: "Thick and fragrant tropical guava blend.", price: "130" },
        { name: "Orange Smoothie", desc: "Fresh oranges with a creamy blended taste.", price: "130" },
        { name: "Banana Smoothie", desc: "Ripe creamy banana blended thick and smooth.", price: "130" },
        { name: "Lemon Mint Smoothie", desc: "Cold lemon and fresh mint blended together.", price: "100" },
        { name: "Lemon Smoothie", desc: "Refreshing lemon blended cold.", price: "130" },
      ]
    },
    {
      id: "milkshakes",
      name: "Milk Shakes",
      tagline: "Classic Creamy Blends",
      emoji: "🍦",
      items: [
        { name: "Vanilla Shake", desc: "Classic creamy vanilla milkshake blended with rich ice cream and cold milk.", price: "90" },
        { name: "Caramel Shake", desc: "Butter caramel blended with vanilla ice cream, topped with golden caramel sauce.", price: "130" },
        { name: "Chocolate Shake", desc: "Rich chocolate milkshake blended with cocoa, ice cream and chocolate drizzle.", price: "100" },
        { name: "Mango Shake", desc: "Tropical mango blend with creamy ice cream for a smooth fruity treat.", price: "100" },
        { name: "Strawberry Shake", desc: "Fresh strawberries blended with vanilla ice cream and a touch of milk.", price: "90" },
        { name: "Oreo Shake", desc: "Crushed Oreos blended with vanilla ice cream, topped with whipped cream.", price: "100" },
      ]
    },
    {
      id: "frappes",
      name: "Frappes",
      tagline: "Blended, Icy, and Indulgent",
      emoji: "☕",
      items: [
        { name: "Frappe Mocha", desc: "Iced mocha blended with espresso, chocolate and whipped cream.", price: "190" },
        { name: "Frappuccino", desc: "Signature iced coffee blended with milk, ice and topped with whipped cream.", price: "110" },
        { name: "Frappe Vanilla", desc: "Creamy vanilla frappuccino blended with milk, ice and a swirl of whipped cream.", price: null },
      ]
    },
  ]
};  

// ─── IMAGES ───────────────────────────────────────────────────────────────────
const CATEGORY_IMAGES = {
  pasta: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80",
  pizza: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
  burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  healthy: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
  chips: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
  kids: "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=800&q=80",
  compo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  popa: "https://images.unsplash.com/photo-1543253687-c931c8e01820?w=800&q=80",
  "ice-drinks": "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=800&q=80",
  "fresh-juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
  smoothies: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80",
  milkshakes: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
  frappes: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80",
};

const ITEM_IMAGES = {
  "Texas Alfredo": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80",
  "Arrabiatta Pasta": "https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?w=600&q=80",
  "Shrimp Pasta": "https://images.unsplash.com/photo-1673044709869-91f4e5e5e8f4?w=600&q=80",
  "Spicy Chicken Ranch": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
  "California Pasta": "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=600&q=80",
  "Spaghetti Bolognese": "https://images.unsplash.com/photo-1551183053-bf91798d792c?w=600&q=80",
  "Mac & Cheese": "https://images.unsplash.com/photo-1543352634-99a5d50ae78e?w=600&q=80",
  "Nigresco Pasta": "https://images.unsplash.com/photo-1599948128020-9a44db9fcc6c?w=600&q=80",
  "Pesto Chicken": "https://images.unsplash.com/photo-1641404764553-a43fb99c6e5e?w=600&q=80",
  "Margherita": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
  "Chicken BBQ": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  "Tuna": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&q=80",
  "Chicken Ranch": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
  "Shrimp": "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&q=80",
  "Vegetable": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&q=80",
  "Super Supreme": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80",
  "Mix Cheese": "https://images.unsplash.com/photo-1548369937-47519962c11a?w=600&q=80",
  "Pepperoni": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&q=80",
  "Classic Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  "Cheese Burger": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80",
  "California Premium": "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&q=80",
  "Spicy Burger": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80",
  "Chicken Crispy": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80",
  "Herb Grilled Chicken": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
  "Chicken & Shrimps": "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&q=80",
  "Grilled Salmon": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80",
  "Fillet Grilled": "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",
  "Original Chips": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
  "Chicken Chips": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80",
  "Fish & Chips": "https://images.unsplash.com/photo-1583835746434-cf1534674b41?w=600&q=80",
  "Tix Mix Chips": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&q=80",
  "Chicken Fingers": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80",
  "Mini Burger": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80",
  "Mini Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
  "California Cocktail": "https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600&q=80",
  "Mojito": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  "Mojito Flavor": "https://images.unsplash.com/photo-1587824741298-2ac7cd94cde3?w=600&q=80",
  "Ice Latte": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
  "Ice Mocha": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80",
  "Vanilla Shake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80",
  "Chocolate Shake": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  "Strawberry Shake": "https://images.unsplash.com/photo-1553787485-60592ca1c2f5?w=600&q=80",
  "Oreo Shake": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80",
  "Watermelon Smoothie": "https://images.unsplash.com/photo-1587058680786-8e43b3793ed6?w=600&q=80",
  "Mango Smoothie": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  "Strawberry Smoothie": "https://images.unsplash.com/photo-1553153303498-d5ef57db1823?w=600&q=80",
  "Frappe Mocha": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80",
  "Frappuccino": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
  "Orange": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
  "Mango": "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80",
  "Strawberry": "https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=600&q=80",
  "Lemon Mint": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  "Pink Popa": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80",
  "Blue Pupls": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80",
  "Crispy Chicken Compo": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "Family Compo": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
};

const getImg = (name, catId) =>
  ITEM_IMAGES[name] || CATEGORY_IMAGES[catId] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80";

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = ({ size = 250 }) => (
  <img
    src={logo}
    alt="California Cuisine"
    style={{
      width: size,
      height: size,
      objectFit: "contain"
    }}
  />
);

// ─── SPLASH ────────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 100);
    const t2 = setTimeout(() => setPhase("glow"), 600);
    const t3 = setTimeout(() => setPhase("out"), 2300);
    const t4 = setTimeout(() => onDone(), 2900);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
      opacity: phase === "out" ? 0 : 1,
      transition: phase === "out" ? "opacity 0.6s ease" : "none",
    }}>
      {/* Red border lines top + bottom — matching the PPTX slide border */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#D91F26" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#D91F26" }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        transform: phase === "in" ? "scale(0.82)" : "scale(1)",
        opacity: phase === "in" ? 0 : 1,
        filter: phase === "glow" ? "drop-shadow(0 0 32px rgba(217,31,38,0.7))" : "drop-shadow(0 0 0px transparent)",
        transition: "transform 0.9s cubic-bezier(0.34,1.56,0.64,1), opacity 0.9s ease, filter 0.6s ease",
      }}>
        <Logo size={170} />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#D91F26", fontFamily: "Georgia,serif", letterSpacing: "clamp(4px,3vw,10px)", fontSize: "clamp(11px,3.5vw,13px)", marginBottom: 6 }}>
            CALIFORNIA
          </div>
          <div style={{ color: "#FFFFFF", fontFamily: "Georgia,serif", letterSpacing: "clamp(4px,4vw,14px)", fontSize: "clamp(18px,6vw,24px)", fontWeight: "bold" }}>
            C U I S I N E
          </div>
          <div style={{ width: 80, height: 2, background: "#D91F26", margin: "14px auto" }} />
          <div style={{ color: "#CCCCCC", fontFamily: "Georgia,serif", letterSpacing: "clamp(3px,2.5vw,8px)", fontSize: "clamp(10px,2.8vw,11px)" }}>
            THE MENU
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORY CARD ─────────────────────────────────────────────────────────────
function CategoryCard({ category, onClick, index }) {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setTimeout(() => setActive(false), 200)}
      style={{
        position: "relative", borderRadius: 4, overflow: "hidden", cursor: "pointer",
        border: `1px solid ${active ? "#D91F26" : "rgba(217,31,38,0.25)"}`,
        boxShadow: active ? "0 8px 32px rgba(217,31,38,0.35)" : "0 4px 20px rgba(0,0,0,0.7)",
        transform: visible ? (active ? "scale(0.97)" : "translateY(0) scale(1)") : "translateY(28px)",
        opacity: visible ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        aspectRatio: "4/3",
        background: "#000",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
    >
      <img
        src={CATEGORY_IMAGES[category.id]}
        alt={category.name}
        style={{
          width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0,
          transform: active ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.45s ease",
          filter: active ? "brightness(0.45)" : "brightness(0.38)",
        }}
        onError={(e) => { e.target.style.display = "none"; }}
      />

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)",
      }} />

      {/* Red left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: "#D91F26",
      }} />

      {/* Item count badge */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        background: "#D91F26",
        borderRadius: 2, padding: "3px 8px",
        color: "#FFFFFF", fontSize: 9, fontFamily: "system-ui,sans-serif",
        fontWeight: 700, letterSpacing: 1,
      }}>
        {category.items.length} ITEMS
      </div>

      {/* Content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 12px 14px 14px" }}>
        <div style={{ fontSize: 22, marginBottom: 4, lineHeight: 1 }}>{category.emoji}</div>
        <div style={{
          color: "#FFFFFF", fontFamily: "Georgia,serif", fontWeight: "bold",
          fontSize: "clamp(12px,3.2vw,18px)", lineHeight: 1.2,
          textTransform: "uppercase", letterSpacing: 0.3,
        }}>{category.name}</div>
        <div style={{
          color: "#CCCCCC", fontFamily: "system-ui,sans-serif",
          fontSize: "clamp(8px,2vw,10px)", letterSpacing: 1, marginTop: 4,
          textTransform: "uppercase", opacity: 0.85,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{category.tagline}</div>
        <div style={{ height: 2, background: "#D91F26", width: "28%", marginTop: 8 }} />
      </div>
    </div>
  );
}

// ─── ITEM CARD ─────────────────────────────────────────────────────────────────
function ItemCard({ item, categoryId, index }) {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 55);
    return () => clearTimeout(t);
  }, [index]);
 
  const hasPrice = item.price && item.price !== "--" && item.price !== "—";
 
  return (
    <div
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setTimeout(() => setActive(false), 300)}
      style={{
        background: "#111111",
        border: `1px solid ${active ? "#D91F26" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 4, overflow: "hidden",
        boxShadow: active ? "0 8px 30px rgba(217,31,38,0.2)" : "0 2px 16px rgba(0,0,0,0.6)",
        transform: visible ? "translateY(0)" : "translateY(18px)",
        opacity: visible ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        display: "flex", flexDirection: "column",
        position: "relative",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Red left bar — always visible on mobile, hover-only on desktop */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: "#D91F26",
        opacity: active ? 1 : 0.3,
        transition: "opacity 0.25s",
        zIndex: 2,
      }} />
 
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
        <img
          src={getImg(item.name, categoryId)}
          alt={item.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: active ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.45s ease",
            filter: "brightness(0.82)",
            display: "block",
          }}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"; }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
        }} />
        {hasPrice ? (
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            background: "#D91F26",
            padding: "6px 14px 6px 10px",
            color: "#FFFFFF", fontFamily: "Georgia,serif",
            fontSize: "clamp(13px,3.5vw,15px)", fontWeight: "bold",
          }}>
            EGP {item.price}
          </div>
        ) : (
          /* Blurred COMING SOON overlay on image */
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            background: "rgba(0,0,0,0.45)",
            zIndex: 3,
          }}>
            <div style={{
              color: "#FFFFFF", fontFamily: "Georgia,serif",
              fontWeight: "bold", fontSize: "clamp(13px,4vw,16px)",
              letterSpacing: "clamp(2px,1.5vw,5px)",
              textTransform: "uppercase", textAlign: "center",
              textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            }}>COMING SOON</div>
            <div style={{ width: 36, height: 2, background: "#D91F26", marginTop: 7 }} />
          </div>
        )}
      </div>
 
      {/* Text */}
      <div style={{ padding: "12px 14px 14px 16px" }}>
        <div style={{
          color: "#FFFFFF", fontFamily: "Georgia,serif",
          fontSize: "clamp(14px,4vw,16px)", fontWeight: "bold", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: 0.3,
        }}>{item.name}</div>
        <div style={{
          color: "#999999", fontFamily: "system-ui,sans-serif",
          fontSize: "clamp(12px,3.2vw,13px)", lineHeight: 1.55,
        }}>{item.desc}</div>
      </div>
    </div>
  );
}

// ─── CATEGORY DETAIL PAGE ──────────────────────────────────────────────────────
function CategoryPage({ category, onBack }) {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);
 
  return (
    <div className="safe-bottom" style={{
      minHeight: "100vh", background: "#000000", paddingBottom: 60,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "all 0.5s ease",
    }}>
      {/* Banner */}
      <div className="cat-banner" style={{ position: "relative", height: "clamp(130px,35vw,320px)", overflow: "hidden" }}>
        <img
          src={CATEGORY_IMAGES[category.id]}
          alt={category.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }}
        />
        {/* Red border top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#D91F26" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 65%, #000000 100%)",
        }} />
 
        {/* Back button — large touch target */}
        <button
          onClick={onBack}
          style={{
            position: "absolute", top: 16, left: 16,
            background: "rgba(0,0,0,0.8)",
            border: "1px solid #D91F26",
            borderRadius: 2,
            minWidth: 44, minHeight: 44,
            padding: "0 18px",
            color: "#FFFFFF", fontFamily: "system-ui,sans-serif",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            letterSpacing: 2, transition: "background 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            WebkitTapHighlightColor: "transparent",
          }}
          onTouchStart={(e) => { e.currentTarget.style.background = "#D91F26"; }}
          onTouchEnd={(e) => { setTimeout(() => { e.currentTarget.style.background = "rgba(0,0,0,0.8)"; }, 200); }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#D91F26"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.8)"; }}
        >
          ← BACK
        </button>
 
        {/* Title */}
        <div style={{
          position: "absolute", bottom: 14, left: 0, right: 0,
          padding: "0 14px", textAlign: "center",
        }}>
          <div style={{ fontSize: "clamp(20px,6vw,36px)", marginBottom: 4, lineHeight: 1 }}>{category.emoji}</div>
          <div style={{
            color: "#FFFFFF", fontFamily: "Georgia,serif", fontWeight: "bold",
            fontSize: "clamp(16px,5vw,38px)", letterSpacing: "clamp(1px,1vw,4px)",
            textTransform: "uppercase", lineHeight: 1.1,
          }}>{category.name}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}>
            <div style={{ width: 24, height: 2, background: "#D91F26", flexShrink: 0 }} />
            <div style={{
              color: "#CCCCCC", fontFamily: "system-ui,sans-serif",
              fontSize: "clamp(8px,2.2vw,11px)", letterSpacing: "clamp(1px,0.8vw,4px)",
              textTransform: "uppercase", textAlign: "center",
            }}>
              {category.tagline}
            </div>
            <div style={{ width: 24, height: 2, background: "#D91F26", flexShrink: 0 }} />
          </div>
        </div>
      </div>
 
      {/* Items */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 12px" }}>
        <div
          className="item-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(min(280px,100%),1fr))",
            gap: 14,
          }}
        >
          {category.items.map((item, i) => (
            <ItemCard key={item.name} item={item} categoryId={category.id} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORIES PAGE ───────────────────────────────────────────────────────────
function CategoriesPage({ onSelect }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="safe-bottom" style={{ minHeight: "100vh", background: "#000000", paddingBottom: 60 }}>
      {/* Red border top — the PPTX signature element */}
      <div style={{ height: 3, background: "#D91F26", width: "100%" }} />

      {/* Header */}
      <div style={{
        padding: "24px 16px 0", textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-16px)",
        transition: "all 0.65s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Logo size={74} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8,
          overflow: "hidden",
        }}>
          <div style={{ width: 36, height: 2, background: "#D91F26", flexShrink: 0 }} />
          <div style={{ color: "#D91F26", fontFamily: "system-ui,sans-serif", fontSize: "clamp(8px,2.5vw,10px)", letterSpacing: "clamp(2px,1.2vw,5px)", fontWeight: 700, whiteSpace: "nowrap" }}>
            EST. CALIFORNIA CUISINE
          </div>
          <div style={{ width: 36, height: 2, background: "#D91F26", flexShrink: 0 }} />
        </div>
        <div style={{
          color: "#FFFFFF", fontFamily: "Georgia,serif",
          fontSize: "clamp(18px,5vw,34px)", fontWeight: "bold",
          letterSpacing: "clamp(2px,1.5vw,5px)", textTransform: "uppercase", marginBottom: 6,
        }}>THE MENU</div>
        <div style={{ color: "#999999", fontFamily: "system-ui,sans-serif", fontSize: "clamp(9px,2.5vw,11px)", letterSpacing: "clamp(1px,1vw,3px)" }}>
          SELECT A CATEGORY
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "26px auto 0", padding: "0 12px" }}>
        <div
          className="cat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(min(250px,100%),1fr))",
            gap: 16,
          }}
        >
          {MENU_DATA.categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} onClick={() => onSelect(cat)} index={i} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "36px 20px 0", color: "#333", fontFamily: "Georgia,serif", fontSize: 11, letterSpacing: 4 }}>
        EST. CALIFORNIA CUISINE
      </div>
      <div style={{ height: 3, background: "#D91F26", width: "100%", marginTop: 30 }} />
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [selected, setSelected] = useState(null);
  const [catVisible, setCatVisible] = useState(false);

  const handleSplashDone = () => {
    setScreen("categories");
    setTimeout(() => setCatVisible(true), 80);
  };

  const handleSelect = (cat) => {
    setSelected(cat);
    setScreen("category");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setScreen("categories");
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#FFFFFF", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; touch-action: manipulation; }
        body {
          background: #000000;
          -webkit-tap-highlight-color: transparent;
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #D91F26; border-radius: 2px; }
        button:focus { outline: 2px solid #D91F26; outline-offset: 2px; }
        button { -webkit-appearance: none; touch-action: manipulation; cursor: pointer; }
        img { -webkit-user-drag: none; user-select: none; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
        @media (max-width: 480px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .item-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
          .item-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 360px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .cat-banner { height: 120px !important; }
        }
        .safe-bottom { padding-bottom: max(60px, calc(60px + env(safe-area-inset-bottom))) !important; }
        @media (max-width: 480px) {
          .cat-banner { height: 150px !important; }
        }
        @media (max-width: 360px) {
          .cat-banner { height: 130px !important; }
        }
      `}</style>

      {screen === "splash" && <SplashScreen onDone={handleSplashDone} />}
      {screen === "categories" && (
        <div style={{ opacity: catVisible ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <CategoriesPage onSelect={handleSelect} />
        </div>
      )}
      {screen === "category" && selected && (
        <CategoryPage category={selected} onBack={handleBack} />
      )}
    </div>
  );
}
