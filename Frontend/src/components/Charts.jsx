import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Line Chart Component
export const LineChart = ({ data, options, title, isDark }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
      title: {
        display: !!title,
        text: title,
        color: isDark ? "#e5e7eb" : "#374151",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: isDark ? "#e5e7eb" : "#374151",
        bodyColor: isDark ? "#e5e7eb" : "#374151",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? "#374151" : "#e5e7eb",
        },
        ticks: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
      y: {
        grid: {
          color: isDark ? "#374151" : "#e5e7eb",
        },
        ticks: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
    },
    ...options,
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={defaultOptions} />
    </div>
  );
};

// Pie Chart Component
export const PieChart = ({ data, options, title, isDark }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: isDark ? "#e5e7eb" : "#374151",
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: isDark ? "#e5e7eb" : "#374151",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: isDark ? "#e5e7eb" : "#374151",
        bodyColor: isDark ? "#e5e7eb" : "#374151",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderWidth: 1,
      },
    },
    ...options,
  };

  return (
    <div className="h-64 w-full">
      <Pie data={data} options={defaultOptions} />
    </div>
  );
};

// Chart Card Component for consistent styling
export const ChartCard = ({ title, children, isDark }) => {
  return (
    <div
      className={`rounded-xl shadow-lg border p-6 transition-all duration-300 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-4 transition-colors ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};
