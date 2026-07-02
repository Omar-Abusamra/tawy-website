// Product data shared across the app
const products = [
  {
    id: 1,
    name: "Classic Denim Jacket",
    brand: "TAWY",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    collection: "denim",
    category: "jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Black"],
    colorImages: {
      Blue: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
      Black: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
    },
    colorMedia: {
      Blue: {
        images: [
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80"
        ],
        video: "https://www.w3schools.com/html/mov_bbb.mp4"
      },
      Black: {
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=800&q=80"
        ]
      }
    },
    inStock: true,
    description: "A structured TAWY layer cut for cool desert evenings.",
    sizeFit: "Fits true to size. Take your normal size.",
    shipping: "Free shipping on all orders. Returns accepted within 14 days.",
    bestSeller: false,
    slug: "classic-denim-jacket"
  },
  {
    id: 2,
    name: "Vintage T-Shirt",
    brand: "TAWY",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    collection: "summer25",
    category: "t-shirts",
    sizes: ["S", "M", "L"],
    colors: ["White", "Black", "Gray"],
    colorImages: {
      White: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
      Black: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      Gray: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80"
    },
    inStock: true,
    description: "A soft cotton piece shaped for Red Sea light and everyday ease.",
    sizeFit: "Fits true to size. Take your normal size.",
    shipping: "Free shipping on all orders. Returns accepted within 14 days.",
    bestSeller: true,
    slug: "vintage-t-shirt"
  },
  {
    id: 3,
    name: "Cargo Jorts",
    brand: "TAWY",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    collection: "denim",
    category: "shorts",
    sizes: ["30", "32", "34", "36"],
    colors: ["Blue", "Black"],
    colorImages: {
      Blue: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
      Black: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
    },
    inStock: true,
    description: "Utility-inspired cotton with a clean TAWY silhouette.",
    sizeFit: "Fits true to size. Take your normal size.",
    shipping: "Free shipping on all orders. Returns accepted within 14 days.",
    bestSeller: false,
    slug: "cargo-jorts"
  },
  {
    id: 4,
    name: "Oversized Hoodie",
    brand: "TAWY",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80",
    collection: "summer25",
    category: "hoodies",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "Black", "Navy"],
    colorImages: {
      Gray: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80",
      Black: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      Navy: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=800&q=80"
    },
    inStock: true,
    description: "An easy oversized layer for coastal nights and slow mornings.",
    sizeFit: "Fits true to size. Take your normal size.",
    shipping: "Free shipping on all orders. Returns accepted within 14 days.",
    bestSeller: true,
    slug: "oversized-hoodie"
  },
  {
    id: 5,
    name: "Graphic Tee",
    brand: "TAWY",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    collection: "ss25",
    category: "t-shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black"],
    colorImages: {
      White: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      Black: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80"
    },
    inStock: false,
    description: "A TAWY cotton tee with a clean graphic presence.",
    sizeFit: "Fits true to size. Take your normal size.",
    shipping: "Free shipping on all orders. Returns accepted within 14 days.",
    bestSeller: true,
    slug: "graphic-tee"
  },
  {
    id: 6,
    name: "Denim Shirt",
    brand: "TAWY",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=800&q=80",
    collection: "denim",
    category: "shirts",
    sizes: ["S", "M", "L"],
    colors: ["Blue", "Light Blue"],
    colorImages: {
      Blue: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=800&q=80",
      "Light Blue": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
    },
    inStock: true,
    description: "A crisp denim shirt balanced between heritage texture and modern wear.",
    sizeFit: "Fits true to size. Take your normal size.",
    shipping: "Free shipping on all orders. Returns accepted within 14 days.",
    bestSeller: false,
    slug: "denim-shirt"
  },
  {
    id: 7,
    name: "Bag",
    brand: "TAWY",
    price: 0,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    collection: "accessories",
    category: "accessories",
    sizes: ["One Size"],
    colors: ["Black", "Blue", "Green", "Gold"],
    colorImages: {
      Black: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      Blue: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
      Green: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      Gold: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
    },
    inStock: true,
    description: "A complimentary TAWY bag prepared with your order.",
    sizeFit: "One size.",
    shipping: "Included with eligible orders. Returns accepted within 14 days.",
    bestSeller: false,
    slug: "bag"
  }
];

export default products; 