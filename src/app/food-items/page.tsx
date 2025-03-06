"use client";

import { useState } from "react";
import { foodItems } from "@/data/foodItems";
import { FoodItem } from "@/types/ingredient";
import FoodItemsHeader from "@/components/food-items/FoodItemsHeader";
import FoodItemsFilter from "@/components/food-items/FoodItemsFilter";
import FoodItemsTable from "@/components/food-items/FoodItemsTable";
import FoodItemModal from "@/components/food-items/FoodItemModal";

export default function FoodItemsPage() {
  const [items, setItems] = useState<FoodItem[]>(foodItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editItem, setEditItem] = useState<FoodItem | null>(null);
  const [newItem, setNewItem] = useState(false);

  const categories = Array.from(new Set(items.map((item) => item.category)));

  const handleSave = (updatedItem: FoodItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setEditItem(null);
  };

  const handleCreate = (newFoodItem: FoodItem) => {
    setItems((prev) => [
      ...prev,
      { ...newFoodItem, id: Date.now().toString() },
    ]);
    setNewItem(false);
  };

  const handleEdit = (item: FoodItem) => {
    setEditItem(item);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "" || item.category === categoryFilter)
  );

  return (
    <div className="container mx-auto p-6">
      <FoodItemsHeader />

      <FoodItemsFilter
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />

      <button
        onClick={() => setNewItem(true)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Add New Item
      </button>

      <FoodItemsTable items={filteredItems} onEdit={handleEdit} />

      {newItem && (
        <FoodItemModal
          onSave={handleCreate}
          onClose={() => setNewItem(false)}
        />
      )}

      {editItem && (
        <FoodItemModal
          item={editItem}
          onSave={handleSave}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
