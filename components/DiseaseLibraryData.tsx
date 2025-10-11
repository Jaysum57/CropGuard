export interface Disease {
  title: string;
  description: string;
  image?: any;
  page: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High';
  commonOn: string[];
  symptoms: string[];
}

export const diseases: Disease[] = [
  {
    title: "Scab",
    description: "Fungal disease causing dark, rough lesions on leaves, fruit, or stems.",
    image: require("../assets/images/scab.jpg"),
    page: "/details/scab",
    category: "Fungal",
    severity: "Medium",
    commonOn: ["Apple", "Pear", "Potato", "Cucumber"],
    symptoms: ["Dark scabby spots", "Leaf deformation", "Reduced fruit quality"]
  },
  {
    title: "Black Rot",
    description: "Causes dark, sunken lesions and rotting of fruit and leaves.",
    image: require("../assets/images/black_rot.jpg"),
    page: "/details/black_rot",
    category: "Fungal",
    severity: "High",
    commonOn: ["Apple", "Grape", "Cabbage", "Sweet Potato"],
    symptoms: ["Dark rotting areas", "Shriveled fruit", "Leaf spots with yellow halos"]
  },
  {
    title: "Rust",
    description: "Fungal disease causing orange or reddish powdery pustules on leaves and stems.",
    image: require("../assets/images/rust.jpg"),
    page: "/details/rust",
    category: "Fungal",
    severity: "High",
    commonOn: ["Wheat", "Bean", "Corn", "Rose"],
    symptoms: ["Orange pustules", "Leaf yellowing", "Premature leaf drop"]
  },
  {
    title: "Powdery Mildew",
    description: "White, powdery fungal growth on leaf surfaces leading to yellowing and distortion.",
    image: require("../assets/images/powdery_mildew.jpg"),
    page: "/details/powdery_mildew",
    category: "Fungal",
    severity: "Medium",
    commonOn: ["Grape", "Cucumber", "Tomato", "Rose"],
    symptoms: ["White powdery coating", "Leaf curling", "Reduced vigor"]
  },
  {
    title: "Gray Leaf Spot",
    description: "Fungal disease creating rectangular gray or tan lesions on leaves.",
    image: require("../assets/images/gray_leaf_spot.jpg"),
    page: "/details/gray_leaf_spot",
    category: "Fungal",
    severity: "Medium",
    commonOn: ["Corn", "Tomato", "Turfgrass"],
    symptoms: ["Gray spots with dark borders", "Leaf blight", "Reduced yield"]
  },
  {
    title: "Citrus Greening",
    description: "Bacterial disease causing yellow shoots, misshapen fruit, and overall tree decline.",
    image: require("../assets/images/citrus_greening.jpg"),
    page: "/details/citrus_greening",
    category: "Bacterial",
    severity: "High",
    commonOn: ["Orange", "Lemon", "Lime"],
    symptoms: ["Yellow shoots", "Bitter fruit", "Leaf blotching"]
  },
  {
    title: "Bacterial Spot",
    description: "Forms dark, water-soaked lesions on leaves and fruit, often with yellow halos.",
    image: require("../assets/images/bacterial_spot.jpg"),
    page: "/details/bacterial_spot",
    category: "Bacterial",
    severity: "Medium",
    commonOn: ["Tomato", "Pepper", "Peach", "Plum"],
    symptoms: ["Dark leaf spots", "Cracked fruit", "Defoliation"]
  },
  {
    title: "Early Blight",
    description: "Causes brown concentric-ring spots on older leaves, leading to leaf drop.",
    image: require("../assets/images/early_blight.jpg"),
    page: "/details/early_blight",
    category: "Fungal",
    severity: "Medium",
    commonOn: ["Tomato", "Potato", "Eggplant"],
    symptoms: ["Brown ringed spots", "Leaf drop", "Reduced fruit size"]
  },
  {
    title: "Late Blight",
    description: "Rapidly spreading disease causing dark, water-soaked lesions on leaves and fruit.",
    image: require("../assets/images/late_blight.jpg"),
    page: "/details/late_blight",
    category: "Fungal",
    severity: "High",
    commonOn: ["Potato", "Tomato"],
    symptoms: ["Blackened leaves", "Rotten fruit", "White mold under leaves"]
  },
  {
    title: "Leaf Scorch",
    description: "Leads to browning of leaf edges due to bacterial infection or stress.",
    image: require("../assets/images/leaf_scorch.jpg"),
    page: "/details/leaf_scorch",
    category: "Bacterial",
    severity: "Medium",
    commonOn: ["Grape", "Olive", "Coffee", "Elm"],
    symptoms: ["Leaf edge browning", "Wilting", "Branch dieback"]
  },
  {
    title: "Leaf Mold",
    description: "Produces olive-green mold on the undersides of tomato leaves.",
    image: require("../assets/images/leaf_mold.jpg"),
    page: "/details/leaf_mold",
    category: "Fungal",
    severity: "Medium",
    commonOn: ["Tomato"],
    symptoms: ["Olive mold under leaves", "Leaf curling", "Yellow spots"]
  },
  {
    title: "Leaf Spot",
    description: "General term for small, discolored spots on leaves caused by fungi or bacteria.",
    image: require("../assets/images/leaf_spot.jpg"),
    page: "/details/leaf_spot",
    category: "Fungal",
    severity: "Low",
    commonOn: ["Strawberry", "Banana", "Bean", "Maize"],
    symptoms: ["Brown or black spots", "Yellowing leaves", "Leaf drop"]
  },
  {
    title: "Two-Spotted Spider Mite",
    description: "Tiny pests that suck sap from leaves, causing yellow speckles and leaf loss.",
    image: require("../assets/images/two_spotted_spider_mite.jpg"),
    page: "/details/two_spotted_spider_mite",
    category: "Pest",
    severity: "Medium",
    commonOn: ["Tomato", "Bean", "Strawberry", "Cucumber"],
    symptoms: ["Tiny yellow spots", "Webbing under leaves", "Leaf drying"]
  },
  {
    title: "Target Spot",
    description: "Fungal disease forming circular lesions with concentric rings like a target.",
    image: require("../assets/images/target_spot.jpg"),
    page: "/details/target_spot",
    category: "Fungal",
    severity: "Medium",
    commonOn: ["Tomato", "Cotton", "Soybean"],
    symptoms: ["Brown spots with rings", "Leaf blight", "Fruit spots"]
  },
  {
    title: "Mosaic Virus",
    description: "Viral infection causing mottled, distorted leaves with light and dark patches.",
    image: require("../assets/images/mosaic_virus.jpg"),
    page: "/details/mosaic_virus",
    category: "Viral",
    severity: "High",
    commonOn: ["Tobacco", "Cucumber", "Tomato", "Pepper"],
    symptoms: ["Mottled leaves", "Leaf curling", "Stunted growth"]
  },
  {
    title: "Leaf Curl Virus",
    description: "Viral infection causing leaf curling, yellowing, and stunted plant growth.",
    image: require("../assets/images/leaf_curl_virus.jpg"),
    page: "/details/leaf_curl_virus",
    category: "Viral",
    severity: "High",
    commonOn: ["Tomato", "Chili", "Cotton", "Papaya"],
    symptoms: ["Leaf curling", "Yellowing", "Stunted growth"]
  }
];

export const categories = ["All", "Fungal", "Bacterial", "Viral", "Pest"];