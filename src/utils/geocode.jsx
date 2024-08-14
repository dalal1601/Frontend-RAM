// src/utils/geocode.js
export const getCoordinates = async (city) => {
    const apiKey = '356240582fe34fb0ab56210390b4e715'; // Replace with your API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lon: lng };
      }
      return null;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };