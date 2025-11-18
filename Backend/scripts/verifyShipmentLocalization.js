const fs = require("fs");
const path = require("path");

// Define the required shipment localization keys
const requiredKeys = [
  "shipments.title",
  "shipments.addNewShipment",
  "shipments.editShipment",
  "shipments.noShipments",
  "shipments.getStarted",
  "shipments.trackingNumber",
  "shipments.fromProvince",
  "shipments.toProvince",
  "shipments.description",
  "shipments.status",
  "shipments.created",
  "shipments.actions",
  "shipments.form.fromProvincePlaceholder",
  "shipments.form.toProvincePlaceholder",
  "shipments.form.trackingNumberPlaceholder",
  "shipments.form.descriptionPlaceholder",
  "shipments.form.addShipment",
  "shipments.form.saveChanges",
  "shipments.form.cancel",
  "shipments.table.trackingNumber",
  "shipments.table.from",
  "shipments.table.to",
  "shipments.table.status",
  "shipments.table.created",
  "shipments.table.actions",
  "shipments.status.pending",
  "shipments.status.in_progress",
  "shipments.status.on_route",
  "shipments.status.delivered",
  "shipments.status.canceled",
  "shipments.confirmDelete",
  "shipments.confirmDeleteTitle",
  "shipments.confirmStatusChange",
  "shipments.confirmStatusChangeTitle",
  "shipments.success.added",
  "shipments.success.updated",
  "shipments.success.deleted",
  "shipments.success.statusUpdated",
  "shipments.errors.fetchFailed",
  "shipments.errors.addFailed",
  "shipments.errors.updateFailed",
  "shipments.errors.deleteFailed",
  "shipments.errors.statusUpdateFailed",
  "shipments.errors.validation.fromProvinceRequired",
  "shipments.errors.validation.toProvinceRequired",
  "shipments.errors.validation.trackingNumberRequired",
  "shipments.errors.validation.provincesSame",
];

// Language files to check
const languageFiles = [
  "../../Frontend/src/i18n/locales/en.json",
  "../../Frontend/src/i18n/locales/prs.json",
  "../../Frontend/src/i18n/locales/pbt.json",
];

// Function to get nested object value by string path
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => current && current[key], obj);
}

// Function to check if all required keys exist in a language file
function checkLanguageFile(filePath) {
  console.log(`\nChecking ${filePath}...`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const langData = JSON.parse(fileContent);

    const missingKeys = [];
    const presentKeys = [];

    requiredKeys.forEach((key) => {
      const value = getNestedValue(langData, key);
      if (value === undefined || value === null || value === "") {
        missingKeys.push(key);
      } else {
        presentKeys.push(key);
      }
    });

    if (missingKeys.length === 0) {
      console.log(`✅ All shipment keys present in ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`❌ Missing keys in ${path.basename(filePath)}:`);
      missingKeys.forEach((key) => console.log(`   - ${key}`));
      return false;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

// Main verification function
function verifyShipmentLocalization() {
  console.log("Verifying shipment localization across all language files...\n");

  let allFilesValid = true;

  languageFiles.forEach((file) => {
    const fullPath = path.resolve(__dirname, file);
    const isFileValid = checkLanguageFile(fullPath);
    if (!isFileValid) {
      allFilesValid = false;
    }
  });

  console.log("\n" + "=".repeat(50));
  if (allFilesValid) {
    console.log("✅ All language files have complete shipment localization!");
  } else {
    console.log(
      "❌ Some language files are missing shipment localization keys."
    );
    console.log("Please check the output above and add the missing keys.");
  }
  console.log("=".repeat(50));

  return allFilesValid;
}

// Run the verification
verifyShipmentLocalization();
