import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HiXMark, HiCheck } from "react-icons/hi2";

const PROVINCES = [
  "Kabul",
  "Herat",
  "Kandahar",
  "Balkh",
  "Nangarhar",
  "Badghis",
  "Badakhshan",
  "Baghlan",
  "Bamyan",
  "Daykundi",
  "Farah",
  "Faryab",
  "Ghazni",
  "Ghor",
  "Helmand",
  "Jowzjan",
  "Kapisa",
  "Khost",
  "Kunar",
  "Kunduz",
  "Laghman",
  "Logar",
  "Nimruz",
  "Nuristan",
  "Paktia",
  "Paktika",
  "Panjshir",
  "Parwan",
  "Samangan",
  "Sar-e Pol",
  "Takhar",
  "Uruzgan",
  "Wardak",
  "Zabul",
];

const EditShipmentModal = ({ isOpen, onClose, shipment, onSave, isDark }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    from_province: "",
    to_province: "",
    tracking_number: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (shipment) {
      setFormData({
        from_province: shipment.from_province || "",
        to_province: shipment.to_province || "",
        tracking_number: shipment.tracking_number || "",
        description: shipment.description || "",
      });
    }
  }, [shipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.from_province ||
      !formData.to_province ||
      !formData.tracking_number
    ) {
      const missingFields = [];
      if (!formData.from_province)
        missingFields.push(t("shipments.fromProvince"));
      if (!formData.to_province) missingFields.push(t("shipments.toProvince"));
      if (!formData.tracking_number)
        missingFields.push(t("shipments.trackingNumber"));

      setError(`${t("common.errors.required")}: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.from_province === formData.to_province) {
      setError(t("shipments.errors.validation.provincesSame"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await onSave(shipment.id, formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.message || t("shipments.errors.updateFailed"));
      }
    } catch (err) {
      console.error("Error updating shipment:", err);
      setError(t("shipments.errors.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl transition-all duration-300 ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          {/* Modal Header */}
          <div
            className={`flex items-center justify-between p-6 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h3
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {t("shipments.editShipment")}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <HiXMark className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {error && (
              <div
                className={`mb-4 p-4 rounded-lg border ${
                  isDark
                    ? "bg-red-900/30 border-red-700 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <HiXMark className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("shipments.fromProvince")} *
                  </label>
                  <select
                    name="from_province"
                    value={formData.from_province}
                    onChange={handleChange}
                    required
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">
                      {t("shipments.form.fromProvincePlaceholder")}
                    </option>
                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("shipments.toProvince")} *
                  </label>
                  <select
                    name="to_province"
                    value={formData.to_province}
                    onChange={handleChange}
                    required
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">
                      {t("shipments.form.toProvincePlaceholder")}
                    </option>
                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("shipments.trackingNumber")} *
                </label>
                <input
                  type="text"
                  name="tracking_number"
                  value={formData.tracking_number}
                  onChange={handleChange}
                  placeholder={t("shipments.form.trackingNumberPlaceholder")}
                  required
                  className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("shipments.description")}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t("shipments.form.descriptionPlaceholder")}
                  rows={4}
                  className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("shipments.form.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } shadow-lg`}
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("common.saving")}
                    </>
                  ) : (
                    <>
                      <HiCheck className="w-5 h-5" />
                      {t("shipments.form.saveChanges")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditShipmentModal;
