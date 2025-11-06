import { useEffect, useState } from 'react';
import { MapPin, CalendarDays, Loader2, X } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ImageGrid } from './components/ImageGrid';
import { GridBackground } from './components/GridBackground';
import { ClusterList } from './components/ClusterList';

// Helper for month names
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Stubs for API functions to keep UI functional; replace with real API layer when backend is ready.
async function getClusters() {
  // simulate network
  await new Promise((r) => setTimeout(r, 400));
  return [
    { id: 1, count: 24, thumbnail: '' },
    { id: 2, count: 13, thumbnail: '' },
    { id: 3, count: 35, thumbnail: '' },
  ];
}
async function searchImages(query, year, month, city) {
  await new Promise((r) => setTimeout(r, 500));
  // return some mocked results so the grid renders
  const seed = `${query}-${year || ''}-${month || ''}-${city || ''}`;
  const n = 12;
  return Array.from({ length: n }, (_, i) => ({
    url: `https://picsum.photos/seed/${encodeURIComponent(seed)}-${i}/600/600`,
    caption: `Result ${i + 1}`,
  }));
}
async function getImagesForCluster(id, limit, offset) {
  await new Promise((r) => setTimeout(r, 500));
  const total = 64;
  const items = Array.from({ length: Math.min(limit, total - offset) }, (_, i) => ({
    url: `https://picsum.photos/seed/cluster-${id}-${offset + i}/600/600`,
    caption: `Cluster ${id} • ${offset + i + 1}`,
  }));
  return { filepaths: items.map((x) => x.url), total };
}
function filepathsToImageResults(filepaths) {
  return filepaths.map((fp) => ({ url: fp }));
}

export default function App() {
  const [images, setImages] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const [clusters, setClusters] = useState([]);
  const [isLoadingClusters, setIsLoadingClusters] = useState(true);
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [clusterImages, setClusterImages] = useState([]);
  const [isLoadingClusterImages, setIsLoadingClusterImages] = useState(false);
  const [totalImagesInCluster, setTotalImagesInCluster] = useState(0);
  const [currentClusterPage, setCurrentClusterPage] = useState(0);
  const [apiError, setApiError] = useState(null);
  const IMAGES_PER_PAGE = 20;

  useEffect(() => {
    const fetchClusters = async () => {
      setIsLoadingClusters(true);
      setApiError(null);
      try {
        const clusterData = await getClusters();
        setClusters(clusterData);
      } catch (err) {
        setApiError('Failed to load clusters.');
        console.error('Cluster loading error:', err);
      } finally {
        setIsLoadingClusters(false);
      }
    };
    fetchClusters();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setIsLoadingSearch(true);
    setHasSearched(true);
    setSelectedClusterId(null);
    setClusterImages([]);
    setApiError(null);

    const yearFilterNum = typeof yearFilter === 'number' && yearFilter > 1900 ? yearFilter : undefined;
    const monthFilterNum = typeof monthFilter === 'number' && monthFilter >= 1 && monthFilter <= 12 ? monthFilter : undefined;

    try {
      const results = await searchImages(query, yearFilterNum, monthFilterNum, cityFilter);
      setImages(results);
    } catch (error) {
      console.error('Search failed:', error);
      setApiError(error?.message || 'Search error occurred.');
      setImages([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const fetchClusterImages = async (clusterId, page) => {
    setIsLoadingClusterImages(true);
    setApiError(null);
    const offset = page * IMAGES_PER_PAGE;
    try {
      const response = await getImagesForCluster(clusterId, IMAGES_PER_PAGE, offset);
      const newImages = filepathsToImageResults(response.filepaths);
      setClusterImages(page === 0 ? newImages : (prev) => [...prev, ...newImages]);
      setTotalImagesInCluster(response.total);
      setCurrentClusterPage(page);
    } catch (err) {
      setApiError(err?.message || `Failed to load images for cluster ${clusterId}.`);
    } finally {
      setIsLoadingClusterImages(false);
    }
  };

  const handleClusterClick = (clusterId) => {
    setSelectedClusterId(clusterId);
    setHasSearched(false);
    setImages([]);
    setClusterImages([]);
    setCurrentClusterPage(0);
    fetchClusterImages(clusterId, 0);
  };
  const showAllClusters = () => {
    setSelectedClusterId(null);
    setClusterImages([]);
    setApiError(null);
  };
  const handleLoadMoreClusterImages = () => {
    if (selectedClusterId === null) return;
    const nextPage = currentClusterPage + 1;
    fetchClusterImages(selectedClusterId, nextPage);
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setYearFilter(value === '' ? '' : parseInt(value, 10));
    }
  };
  const handleMonthChange = (e) => {
    const value = e.target.value;
    setMonthFilter(value === '' ? '' : parseInt(value, 10));
  };

  const hasMoreClusterImages = clusterImages.length < totalImagesInCluster;

  return (
    <div className="min-h-screen w-screen relative bg-black text-white overflow-x-hidden p-6 md:p-10">
      <GridBackground />

      <div className="relative z-10 flex flex-col items-center w-full">
        <h1 className="md:text-6xl text-4xl lg:text-7xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-8">
          Explore Pixora
        </h1>

        <div className="opacity-100 w-full max-w-3xl mx-auto flex flex-col space-y-4 mb-10 md:mb-16">
          <SearchBar onSearch={handleSearch} isLoading={isLoadingSearch} />
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full items-center">
            <div className="relative flex-grow w-full">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by location..."
                className="w-full p-3 pl-10 rounded-full bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm focus:shadow-md"
                disabled={isLoadingSearch || isLoadingClusterImages}
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
              <select
                value={monthFilter}
                onChange={handleMonthChange}
                className="w-full sm:w-36 p-3 pl-10 pr-8 rounded-full bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm focus:shadow-md appearance-none"
                disabled={isLoadingSearch || isLoadingClusterImages}
              >
                <option value="">All Months</option>
                {monthNames.map((n, i) => (
                  <option key={i + 1} value={i + 1}>
                    {n}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.516 7.548l4.484 4.484 4.484-4.484z" />
                </svg>
              </div>
            </div>

            <div className="relative w-full sm:w-auto">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input
                type="number"
                value={yearFilter}
                onChange={handleYearChange}
                placeholder="Year"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full sm:w-32 p-3 pl-10 rounded-full bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm focus:shadow-md text-center"
                disabled={isLoadingSearch || isLoadingClusterImages}
              />
            </div>
          </div>
        </div>

        {apiError && (
          <div className="text-center text-red-400 text-lg mb-6 p-4 bg-red-900/40 rounded border border-red-700 max-w-lg mx-auto">
            Error: {apiError}
            <button onClick={() => setApiError(null)} className="ml-4 text-red-300 hover:text-white">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="relative z-10 container mx-auto px-0 md:px-4 w-full">
          {selectedClusterId === null && !hasSearched && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-300">Discover by Topic</h2>
              <ClusterList
                clusters={clusters}
                isLoading={isLoadingClusters}
                onSelect={handleClusterClick}
              />
            </>
          )}

          {selectedClusterId === null && hasSearched && (
            <>
              <h2 className="text-3xl font-semibold text-center mb-10 border-b border-gray-700 pb-2 inline-block mx-auto">
                Search Results
              </h2>
              {isLoadingSearch ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : images.length > 0 ? (
                <ImageGrid images={images} />
              ) : !apiError ? (
                <div className="text-center text-gray-400 text-lg py-10">
                  No relevant images found matching your search criteria.
                </div>
              ) : null}
            </>
          )}

          {selectedClusterId !== null && (
            <>
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={showAllClusters}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
                >
                  &larr; All Clusters
                </button>
                <h2 className="text-2xl font-semibold text-center text-gray-300">
                  Cluster {selectedClusterId}{' '}
                  <span className="text-base font-normal text-gray-500">
                    ({totalImagesInCluster} images)
                  </span>
                </h2>
                <div className="w-28"></div>
              </div>

              {isLoadingClusterImages && clusterImages.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : clusterImages.length > 0 ? (
                <ImageGrid images={clusterImages} />
              ) : !apiError ? (
                <div className="text-center text-gray-500 py-10">
                  No images found in this cluster.
                </div>
              ) : null}

              {isLoadingClusterImages && clusterImages.length > 0 && (
                <div className="flex justify-center items-center h-20 mt-6">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                </div>
              )}

              {!isLoadingClusterImages && (clusterImages.length < totalImagesInCluster) && (
                <div className="text-center mt-10">
                  <button
                    onClick={handleLoadMoreClusterImages}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full transition-colors disabled:opacity-50"
                    disabled={isLoadingClusterImages}
                  >
                    Load More ({clusterImages.length} / {totalImagesInCluster})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
