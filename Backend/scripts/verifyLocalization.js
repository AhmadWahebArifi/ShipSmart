const fs = require("fs");
const path = require("path");

// Function to check if all required keys exist in localization files
function verifyLocalization() {
  const localesDir = path.join(__dirname, "../../Frontend/src/i18n/locales");
  const locales = ["en.json", "prs.json", "pbt.json"];

  const requiredKeys = [
    "products.table.status",
    "shipmentStatus.pending",
    "shipmentStatus.in_progress",
    "shipmentStatus.on_route",
    "shipmentStatus.delivered",
    "shipmentStatus.canceled",
    "common.update",
    "products.confirmDeleteTitle",
  ];

  console.log("🔍 Verifying localization files...\n");

  locales.forEach((locale) => {
    const filePath = path.join(localesDir, locale);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log(`📄 Checking ${locale}...`);

      let allKeysFound = true;
      requiredKeys.forEach((key) => {
        // Navigate through the nested object to find the key
        const keyParts = key.split(".");
        let current = content;
        let found = true;

        for (const part of keyParts) {
          if (current && current.hasOwnProperty(part)) {
            current = current[part];
          } else {
            found = false;
            break;
          }
        }

        if (found) {
          console.log(`  ✅ ${key}: Found`);
        } else {
          console.log(`  ❌ ${key}: Missing`);
          allKeysFound = false;
        }
      });

      if (allKeysFound) {
        console.log(`  🎉 All required keys found in ${locale}\n`);
      } else {
        console.log(`  ⚠️  Some keys missing in ${locale}\n`);
      }
    } catch (error) {
      console.error(`  ❌ Error reading ${locale}:`, error.message);
    }
  });

  console.log("✅ Localization verification completed!");
}

verifyLocalization();
