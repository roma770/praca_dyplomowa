import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import eventsData from '../data/events.json';

export const EventModal = () => {
  const isOpen = useCartStore((s) => s.isEventModalOpen);
  const closeEventModal = useCartStore((s) => s.closeEventModal);
  const addEventToCart = useCartStore((s) => s.addEventToCart);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="event-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeEventModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={closeEventModal}
              aria-label="Zamknij"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-2 text-rose-500 font-bold mb-2">
              <Sparkles size={20} />
              <span>Dodaj wyjątkowy akcent do prezentu</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Podarujcie sobie wspólny czas
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Do bukietu możesz dołączyć zaproszenie na kolację lub wspólny seans.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {eventsData.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-xl overflow-hidden hover:shadow-md transition"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-4">
                    <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-2 py-1 rounded">
                      {event.type}
                    </span>
                    <h3 className="font-bold text-gray-800 text-base mt-2">{event.title}</h3>
                    <p className="text-xs text-green-600 font-medium mt-1">{event.discount}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-gray-900">{event.price} zł</span>
                      <button
                        onClick={() => addEventToCart(event)}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 py-2 rounded-lg transition"
                      >
                        Dodaj do zestawu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={closeEventModal}
              className="w-full mt-6 py-2 border border-gray-300 rounded-xl text-gray-600 text-sm hover:bg-gray-50"
            >
              Dziękuję, zostaję przy kwiatach
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
