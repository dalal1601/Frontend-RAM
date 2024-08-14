// src/utils/api.js
export const fetchCities = async () => {
    const response = await fetch('http://localhost:8080/Audit'); // Replace with your actual API endpoint
    const data = await response.json();
    // Assuming the response has a list of audits and each audit has an escaleVille attribute
    const cities = data.map(audit => audit.escaleVille).flat();
    return [...new Set(cities)]; // Remove duplicates if needed
  };
  