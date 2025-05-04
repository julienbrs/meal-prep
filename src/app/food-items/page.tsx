"use client";

import { useState, useEffect } from "react";
import { FoodItem } from "@/types/ingredient";
import FoodItemsHeader from "@/components/food-items/FoodItemsHeader";
import FoodItemsFilter from "@/components/food-items/FoodItemsFilter";
import FoodItemsTable from "@/components/food-items/FoodItemsTable";
import FoodItemModal from "@/components/food-items/FoodItemModal";
import {
  loadFoodItems,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
} from "@/services/dataservice";

export default function FoodItemsPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editItem, setEditItem] = useState<FoodItem | null>(null);
  const [newItem, setNewItem] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState<FoodItem | null>(null); // Nouvel état pour la duplication

  // Load food items on component mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await loadFoodItems();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Échec du chargement des aliments:", err);
        setError(
          "Échec du chargement des aliments. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Extract categories from items
  const categories = Array.from(new Set(items.map((item) => item.category)));

  // Handler for saving an edited item
  const handleSave = async (updatedItem: FoodItem) => {
    try {
      const success = await updateFoodItem(updatedItem);

      if (success) {
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        setEditItem(null);
      } else {
        setError("Échec de la mise à jour de l'élément. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'aliment:", err);
      setError(
        "Une erreur s'est produite lors de la mise à jour de l'élément."
      );
    }
  };

  // Handler for creating a new item
  const handleCreate = async (newFoodItem: FoodItem) => {
    try {
      const success = await addFoodItem(newFoodItem);

      if (success) {
        // Reload items to get the updated list with the new item
        const updatedItems = await loadFoodItems();
        setItems(updatedItems);
        setNewItem(false);
        setDuplicateItem(null); // Réinitialiser l'état de duplication
      } else {
        setError("Échec de la création de l'élément. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la création de l'aliment:", err);
      setError("Une erreur s'est produite lors de la création de l'élément.");
    }
  };

  // Handler for editing an item
  const handleEdit = (item: FoodItem) => {
    setEditItem(item);
  };

  // Handler for duplicating an item
  const handleDuplicate = (item: FoodItem) => {
    // Créer une copie de l'item mais sans l'ID pour en faire un nouvel élément
    const itemCopy = {
      ...item,
      id: "", // Vider l'ID pour que le backend en génère un nouveau
      name: `${item.name} (copie)`, // Ajouter "(copie)" au nom
    };
    setDuplicateItem(itemCopy);
  };

  // Handler for deleting an item
  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      try {
        const success = await deleteFoodItem(id);

        if (success) {
          setItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          setError("Échec de la suppression de l'élément. Veuillez réessayer.");
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'aliment:", err);
        setError(
          "Une erreur s'est produite lors de la suppression de l'élément."
        );
      }
    }
  };

  // Filter items based on search and category
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "" || item.category === categoryFilter)
  );

  return (
    <div className="container mx-auto p-6">
      <FoodItemsHeader />

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

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
        Ajouter un Nouvel Élément
      </button>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <FoodItemsTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate} // Ajouter le gestionnaire de duplication
        />
      )}

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

      {duplicateItem && (
        <FoodItemModal
          item={duplicateItem}
          onSave={handleCreate} // Utiliser le gestionnaire de création pour les items dupliqués
          onClose={() => setDuplicateItem(null)}
          isDuplicate={true} // Indiquer que c'est une duplication
        />
      )}
    </div>
  );
}
