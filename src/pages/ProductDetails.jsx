import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star } from 'lucide-react';
import { useStoreProducts } from '../hooks/useStoreProducts';
import { useCartStore } from '../store/useCartStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { fetchProductReviews, submitProductReview } from '../lib/orderApi';
import { resolveProductImage } from '../lib/productImage';

const dateLabel = (value) => new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium' }).format(new Date(value));

export const ProductDetails = () => {
  const { id } = useParams();
  const { products, loading } = useStoreProducts();
  const product = products.find((item) => item.id === id);
  const addToCart = useCartStore((state) => state.addToCart);
  const cartQuantity = useCartStore((state) => state.cart.find((item) => item.id === id)?.quantity || 0);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', comment: '' });
  const isFavorite = favoriteIds.includes(id);
  const quantityLimitReached = Number.isInteger(product?.stock) && cartQuantity >= product.stock;

  useEffect(() => {
    let active = true;
    setLoadingReviews(true);
    fetchProductReviews(id)
      .then((items) => { if (active) setReviews(items); })
      .catch((error) => { if (active) setReviewError(error.message); })
      .finally(() => { if (active) setLoadingReviews(false); });
    return () => { active = false; };
  }, [id]);

  const averageRating = useMemo(() => reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0, [reviews]);

  if (!product && loading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-gray-500">Ładowanie produktu…</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Nie znaleźliśmy tego produktu</h1>
        <Link to="/" className="mt-5 inline-flex items-center gap-2 text-rose-600 hover:underline"><ArrowLeft size={17} /> Wróć do sklepu</Link>
      </div>
    );
  }

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSavingReview(true);
    try {
      const saved = await submitProductReview(id, { ...reviewForm, rating });
      setReviews((current) => [saved, ...current]);
      setReviewForm({ name: '', email: '', comment: '' });
      setRating(5);
      setReviewSuccess('Dziękujemy za opinię!');
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <Link to={product.category === 'mens' ? '/mens' : '/'} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-rose-600"><ArrowLeft size={17} /> Wróć do oferty</Link>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
          <img src={resolveProductImage(product.image)} alt={product.name} className="h-full min-h-[320px] max-h-[650px] w-full object-cover" />
          <button type="button" onClick={() => toggleFavorite(product.id)} aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'} aria-pressed={isFavorite} className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-rose-500">
            <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Bloom & Joy</p>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-amber-500">
            <Star size={17} fill={averageRating ? 'currentColor' : 'none'} />
            <span className="font-semibold">{averageRating ? averageRating.toFixed(1) : '—'}</span>
            <a href="#reviews" className="text-sm text-gray-500 underline">{reviews.length} {reviews.length === 1 ? 'opinia' : 'opinii'}</a>
          </div>
          <p className="mt-6 text-3xl font-bold text-rose-600">{product.price} zł</p>
          <p className="mt-5 leading-7 text-gray-600">{product.description}</p>
          <p className="mt-5 text-sm text-gray-500">{product.stock === 0 ? 'Chwilowo niedostępny' : Number.isInteger(product.stock) ? `Dostępne sztuki: ${product.stock}` : 'Dostępny na zamówienie'}</p>
          <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0 || quantityLimitReached} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3.5 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-fit">
            <ShoppingCart size={19} /> {product.stock === 0 ? 'Brak w magazynie' : quantityLimitReached ? 'Dodano cały zapas' : 'Dodaj do koszyka'}
          </button>
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-gray-100 pt-6 text-sm text-gray-500">
            <p>Starannie przygotowany prezent</p><p>Bezpieczne zamówienie online</p>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-14 grid gap-8 border-t border-gray-200 pt-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-semibold uppercase tracking-wider text-rose-500">Wasze głosy</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Opinie o produkcie</h2></div>
            <p className="text-sm text-gray-500">{reviews.length ? `Średnia ocen: ${averageRating.toFixed(1)} / 5` : 'Bądź pierwszą osobą, która oceni ten produkt'}</p>
          </div>
          {reviewError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{reviewError}</p>}
          {loadingReviews ? <p className="mt-6 text-sm text-gray-500">Ładowanie opinii…</p> : reviews.length ? (
            <div className="mt-6 space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-gray-800">{review.name}</h3><time className="text-xs text-gray-400">{dateLabel(review.createdAt)}</time></div><span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500"><Star size={15} fill="currentColor" /> {review.rating}/5</span></div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment}</p>
                </article>
              ))}
            </div>
          ) : <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-gray-500">Nie ma jeszcze opinii. Podziel się pierwszym wrażeniem.</p>}
        </div>

        <form onSubmit={submitReview} className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Dodaj opinię</h3>
          {reviewSuccess && <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{reviewSuccess}</p>}
          <label className="mt-4 block text-sm font-medium text-gray-700">Twoja ocena</label>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Ocena produktu">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} onClick={() => setRating(value)} aria-label={`${value} na 5`} className="p-1 text-amber-500"><Star size={24} fill={rating >= value ? 'currentColor' : 'none'} /></button>)}
          </div>
          <label className="mt-4 block text-sm font-medium text-gray-700">Imię<input required minLength={2} maxLength={80} value={reviewForm.name} onChange={(event) => setReviewForm({ ...reviewForm, name: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-rose-400" /></label>
          <label className="mt-3 block text-sm font-medium text-gray-700">E-mail (opcjonalnie)<input type="email" maxLength={160} value={reviewForm.email} onChange={(event) => setReviewForm({ ...reviewForm, email: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-rose-400" /></label>
          <label className="mt-3 block text-sm font-medium text-gray-700">Opinia<textarea required minLength={5} maxLength={500} rows={4} value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} className="mt-1 w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-rose-400" /></label>
          <button disabled={savingReview} className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-60">{savingReview ? 'Zapisywanie…' : 'Opublikuj opinię'}</button>
        </form>
      </section>
    </div>
  );
};
