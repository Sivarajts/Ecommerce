import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/products/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.slice(0, 5).map(cat => (
          <li key={cat.id}>{cat.category_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
