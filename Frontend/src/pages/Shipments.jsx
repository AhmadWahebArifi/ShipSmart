import React, { useState } from "react";

const Shipment = () => {
  const [shipments, setShipments] = useState([
    {
      id: 1,
      trackingId: "TRK123456",
      destination: "New York, USA",
      status: "In Transit",
      date: "2025-11-05",
    },
    {
      id: 2,
      trackingId: "TRK987654",
      destination: "Berlin, Germany",
      status: "Delivered",
      date: "2025-11-03",
    },
  ]);

  const [newShipment, setNewShipment] = useState({
    trackingId: "",
    destination: "",
    status: "",
    date: "",
  });

  const handleChange = (e) => {
    setNewShipment({ ...newShipment, [e.target.name]: e.target.value });
  };

  const handleAddShipment = (e) => {
    e.preventDefault();
    if (!newShipment.trackingId || !newShipment.destination) return;
    setShipments([
      ...shipments,
      { ...newShipment, id: shipments.length + 1 },
    ]);
    setNewShipment({ trackingId: "", destination: "", status: "", date: "" });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📦 Shipments</h1>

      {/* Add Shipment Form */}
      <form
        onSubmit={handleAddShipment}
        className="bg-white shadow-md rounded-xl p-5 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Add New Shipment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="trackingId"
            value={newShipment.trackingId}
            onChange={handleChange}
            placeholder="Tracking ID"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            name="destination"
            value={newShipment.destination}
            onChange={handleChange}
            placeholder="Destination"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            name="status"
            value={newShipment.status}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
          <input
            type="date"
            name="date"
            value={newShipment.date}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          Add Shipment
        </button>
      </form>

      {/* Shipment Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-200 text-gray-700 uppercase text-sm">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Tracking ID</th>
              <th className="p-3 text-left">Destination</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr
                key={shipment.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">{shipment.id}</td>
                <td className="p-3 font-medium text-blue-600">
                  {shipment.trackingId}
                </td>
                <td className="p-3">{shipment.destination}</td>
                <td
                  className={`p-3 font-semibold ${
                    shipment.status === "Delivered"
                      ? "text-green-600"
                      : shipment.status === "Pending"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                >
                  {shipment.status}
                </td>
                <td className="p-3">{shipment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shipment;
