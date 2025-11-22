const fs = require("fs");
const path = require("path");

// Parse the Provinces.txt file to extract route data
function parseProvincesRoutes() {
  const filePath = path.join(__dirname, "..", "..", "Provinces.txt");

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    // Skip header line
    const dataLines = lines.slice(1);

    const routes = {};
    const neighbors = {};

    dataLines.forEach((line) => {
      // Split by tabs and clean up
      const parts = line
        .split("\t")
        .map((part) => part.trim())
        .filter((part) => part);

      if (parts.length >= 3) {
        const fromProvince = parts[0];
        const toProvince = parts[1];
        const routePath = parts[2];

        // Store the full route
        const routeKey = `${fromProvince}-${toProvince}`;
        routes[routeKey] = routePath;

        // Extract neighbors from the route path
        const routeSteps = routePath.split(" → ").map((step) => step.trim());

        // Initialize neighbors array if not exists
        if (!neighbors[fromProvince]) {
          neighbors[fromProvince] = new Set();
        }
        if (!neighbors[toProvince]) {
          neighbors[toProvince] = new Set();
        }

        // Add direct neighbors from the route
        for (let i = 0; i < routeSteps.length - 1; i++) {
          const current = routeSteps[i];
          const next = routeSteps[i + 1];

          if (!neighbors[current]) {
            neighbors[current] = new Set();
          }
          if (!neighbors[next]) {
            neighbors[next] = new Set();
          }

          neighbors[current].add(next);
          neighbors[next].add(current);
        }
      }
    });

    // Convert Sets to Arrays
    const neighborsArray = {};
    Object.keys(neighbors).forEach((province) => {
      neighborsArray[province] = Array.from(neighbors[province]);
    });

    return {
      routes,
      neighbors: neighborsArray,
    };
  } catch (error) {
    console.error("Error parsing Provinces.txt:", error);
    return {
      routes: {},
      neighbors: {},
    };
  }
}

// Generate the updated provincial connections file
function generateUpdatedConnections() {
  const { routes, neighbors } = parseProvincesRoutes();

  const output = `// Provincial road connections data for Afghanistan
// Generated from Provinces.txt file
// Key: Province name (English), Value: Array of directly connected provinces (English)

const PROVINCIAL_CONNECTIONS = ${JSON.stringify(neighbors, null, 2)};

// Full routes between provinces
const PROVINCIAL_ROUTES = ${JSON.stringify(routes, null, 2)};

module.exports = {
  PROVINCIAL_CONNECTIONS,
  PROVINCIAL_ROUTES,
};`;

  // Write to a new file
  const outputPath = path.join(
    __dirname,
    "..",
    "routes",
    "provincialRoutesData.js"
  );
  fs.writeFileSync(outputPath, output);

  console.log("Generated provincial routes data:", outputPath);
  console.log("Found", Object.keys(routes).length, "routes");
  console.log(
    "Found",
    Object.keys(neighbors).length,
    "provinces with neighbors"
  );

  return { routes, neighbors };
}

// Run the parser
if (require.main === module) {
  generateUpdatedConnections();
}

module.exports = {
  parseProvincesRoutes,
  generateUpdatedConnections,
};
