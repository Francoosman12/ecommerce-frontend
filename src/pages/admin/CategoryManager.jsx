import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { FaPlus, FaTags, FaTrash, FaEdit, FaTimes } from "react-icons/fa";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosClient.get("/categories");
      setCategories(data);
    } catch {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setLoading(true);
    try {
      if (editingCategory) {
        await axiosClient.put(`/categories/${editingCategory._id}`, {
          name: categoryName,
        });
        toast.success("Categoría actualizada");
      } else {
        await axiosClient.post("/categories", { name: categoryName });
        toast.success("Categoría creada");
      }
      resetForm();
      fetchCategories();
    } catch {
      toast.error("Error al guardar categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
  };
  const resetForm = () => {
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Eliminar esta categoría? Esto puede afectar productos asociados.",
      )
    ) {
      try {
        await axiosClient.delete(`/categories/${id}`);
        toast.success("Categoría eliminada");
        if (editingCategory?._id === id) resetForm();
        fetchCategories();
      } catch {
        toast.error("No se pudo eliminar");
      }
    }
  };

  const inputClass =
    "w-full border border-cin-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cin-300 bg-white text-cin-800 placeholder-cin-300";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl text-cin-800 flex items-center gap-3">
            <FaTags className="text-cin-600" size={20} /> Categorías
          </h1>
          <p className="text-cin-400 text-sm mt-1">
            Gestioná los departamentos de tu tienda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="md:col-span-1">
            <div
              className={`rounded-2xl border p-6 sticky top-24 transition-colors ${
                editingCategory
                  ? "bg-cin-50 border-cin-400"
                  : "bg-white border-cin-200"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-base text-cin-700">
                  {editingCategory ? "Editar categoría" : "Nueva categoría"}
                </h3>
                {editingCategory && (
                  <button
                    onClick={resetForm}
                    className="text-cin-400 hover:text-cin-700 transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-cin-500 uppercase tracking-wide mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Bufandones"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${
                    editingCategory
                      ? "bg-cin-600 hover:bg-cin-700"
                      : "bg-cin-700 hover:bg-cin-800"
                  } disabled:opacity-60`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingCategory ? (
                    <>
                      <FaEdit size={13} /> Actualizar
                    </>
                  ) : (
                    <>
                      <FaPlus size={13} /> Crear categoría
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Listado */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-cin-200 overflow-hidden">
              <div className="px-5 py-4 bg-cin-50 border-b border-cin-100 flex justify-between items-center">
                <span className="font-medium text-cin-700 text-sm">
                  Categorías activas
                </span>
                <span className="text-xs bg-cin-200 text-cin-700 px-2.5 py-1 rounded-full font-medium">
                  {categories.length} en total
                </span>
              </div>

              <ul className="divide-y divide-cin-100">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className={`px-5 py-4 flex justify-between items-center transition-colors ${
                      editingCategory?._id === cat._id
                        ? "bg-cin-50"
                        : "hover:bg-cin-50/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-cin-800 text-sm">
                        {cat.name}
                      </p>
                      <p className="text-xs text-cin-400 font-mono mt-0.5">
                        /{cat.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-2 text-cin-400 hover:text-cin-700 hover:bg-cin-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-cin-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="p-10 text-center text-cin-400 text-sm italic">
                    No hay categorías creadas aún.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryManager;
