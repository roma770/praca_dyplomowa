import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Image, Pencil, Plus, RefreshCw, Save, X } from 'lucide-react';
import { createProduct, fetchAdminProducts, updateProduct } from '../lib/orderApi';
import { resolveProductImage } from '../lib/productImage';

const categories = [
  { value: 'bouquets', label: 'Bukiety' },
  { value: 'mens', label: 'Bukiety dla niego' },
  { value: 'balloons', label: 'Balony' },
  { value: 'souvenirs', label: 'Upominki' },
];

const emptyProduct = () => ({
  name: '',
  category: 'bouquets',
  price: '',
  stock: 10,
  image: '',
  description: '',
  isActive: true,
});

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100';

export const AdminProducts = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProductId, setSavingProductId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProducts(await fetchAdminProducts(token));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock ?? 0),
      image: product.image,
      description: product.description,
      isActive: product.isActive,
    });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId('');
    setForm(emptyProduct());
    setError('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) {
        const updatedProduct = await updateProduct(token, editingId, payload);
        setProducts((current) => current.map((product) =>
          product.id === editingId ? updatedProduct : product
        ));
        setSuccess('Zmiany produktu zostały zapisane.');
      } else {
        const createdProduct = await createProduct(token, payload);
        setProducts((current) => [createdProduct, ...current]);
        setSuccess('Produkt został dodany do katalogu.');
      }
      setEditingId('');
      setForm(emptyProduct());
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVisibility = async (product) => {
    setSavingProductId(product.id);
    setError('');
    setSuccess('');
    try {
      const updatedProduct = await updateProduct(token, product.id, {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock ?? 0,
        image: product.image,
        description: product.description,
        isActive: !product.isActive,
      });
      setProducts((current) => current.map((entry) =>
        entry.id === product.id ? updatedProduct : entry
      ));
      setSuccess(updatedProduct.isActive ? 'Produkt znów jest widoczny w sklepie.' : 'Produkt został ukryty w sklepie.');
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSavingProductId('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editingId ? 'Edytuj produkt' : 'Dodaj produkt'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">Zapisane zmiany pojawią się w katalogu sklepu.</p>
          </div>
          {editingId && (
            <button type="button" onClick={cancelEditing} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <X size={16} /> Anuluj
            </button>
          )}
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Nazwa produktu
            <input name="name" value={form.name} onChange={updateField} required maxLength={120} className={`${inputClass} mt-1.5`} placeholder="np. Bukiet róż" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Kategoria
            <select name="category" value={form.category} onChange={updateField} className={`${inputClass} mt-1.5`}>
              {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">
            Cena (zł)
            <input name="price" type="number" min="1" max="10000000" step="1" value={form.price} onChange={updateField} required className={`${inputClass} mt-1.5`} placeholder="np. 1200" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Stan magazynowy (szt.)
            <input name="stock" type="number" min="0" max="1000000" step="1" value={form.stock} onChange={updateField} required className={`${inputClass} mt-1.5`} placeholder="np. 10" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Adres zdjęcia
            <input name="image" type="text" value={form.image} onChange={updateField} required maxLength={1000} className={`${inputClass} mt-1.5`} placeholder="https://… lub images/catalog/…" />
          </label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Opis
            <textarea name="description" value={form.description} onChange={updateField} maxLength={1000} rows={3} className={`${inputClass} mt-1.5 resize-y`} placeholder="Krótki opis widoczny w sklepie" />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700 md:col-span-2">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} className="h-4 w-4 accent-rose-500" />
            Produkt widoczny w sklepie
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-wait disabled:opacity-60">
          {saving ? <RefreshCw size={17} className="animate-spin" /> : editingId ? <Save size={17} /> : <Plus size={18} />}
          {saving ? 'Zapisywanie…' : editingId ? 'Zapisz zmiany' : 'Dodaj produkt'}
        </button>
      </form>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Produkty w sklepie</h2>
            <p className="mt-1 text-sm text-gray-500">
              Widoczne: {products.filter((product) => product.isActive).length} z {products.length}
              <span className="px-2">·</span>
              Bez zapasu: {products.filter((product) => (product.stock ?? 0) === 0).length}
            </p>
          </div>
          <button type="button" onClick={loadProducts} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Odśwież
          </button>
        </div>

        {loading && products.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Ładowanie produktów…</p>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center text-gray-500">Nie ma jeszcze produktów.</div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <article key={product.id} className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${product.isActive ? 'border-gray-100' : 'border-amber-100 bg-amber-50/50'}`}>
                {product.image ? (
                  <img src={resolveProductImage(product.image)} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400"><Image size={24} /></div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                      {product.isActive ? 'Widoczny' : 'Ukryty'}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${(product.stock ?? 0) > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      {(product.stock ?? 0) > 0 ? `Stan: ${product.stock} szt.` : 'Brak w magazynie'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {categories.find((category) => category.value === product.category)?.label || product.category}
                    <span className="px-2">·</span>
                    <strong className="text-gray-700">{product.price} zł</strong>
                  </p>
                  {product.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => startEditing(product)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    <Pencil size={15} /> Edytuj
                  </button>
                  <button type="button" onClick={() => handleVisibility(product)} disabled={savingProductId === product.id} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    {savingProductId === product.id ? <RefreshCw size={15} className="animate-spin" /> : product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                    {product.isActive ? 'Ukryj' : 'Pokaż'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
