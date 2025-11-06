import { Loader2 } from 'lucide-react';

export function ClusterList({ clusters, isLoading, onSelect }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!clusters || clusters.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No clusters found.
      </div>
    );
  }

  const getImageUrl = (filepath) => {
    if (!filepath) return 'https://placehold.co/200x200/111/444?text=N/A';
    return `http://127.0.0.1:8000/${filepath}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {clusters.map((cluster) => (
        <button
          key={cluster.id}
          onClick={() => onSelect(cluster.id)}
          className="cursor-pointer border border-gray-800 rounded-lg overflow-hidden hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 group relative aspect-square bg-gray-900"
          title={`View Cluster ${cluster.id} (${cluster.count} images)`}
        >
          <img
            src={getImageUrl(cluster.thumbnail)}
            alt={`Cluster ${cluster.id} thumbnail`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200/111/444?text=Thumb'; }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 text-center transition-opacity duration-300 opacity-100 sm:opacity-0 group-hover:opacity-100">
            <p className="text-sm font-semibold text-white">Cluster {cluster.id}</p>
            <p className="text-xs text-gray-300">{cluster.count} items</p>
          </div>
        </button>
      ))}
    </div>
  );
}
