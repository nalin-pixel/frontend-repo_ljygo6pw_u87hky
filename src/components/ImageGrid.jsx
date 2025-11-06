export function ImageGrid({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {images.map((img, idx) => (
        <div key={idx} className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
          <img
            src={img.url || img.src || img.filepath || 'https://placehold.co/600x600/111/444?text=Image'}
            alt={img.alt || img.caption || `Image ${idx + 1}`}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/111/444?text=Image'; }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {(img.caption || img.title) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-xs text-gray-100">
              {img.caption || img.title}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
