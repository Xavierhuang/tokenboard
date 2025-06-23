import { useEffect, useState } from "react";

type CentrifugePool = {
  pool_name: string;
  link: string;
  details: { [key: string]: string };
};

export default function CentrifugePoolsListings() {
  const [pools, setPools] = useState<CentrifugePool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/centrifuge_pools.json")
      .then((res) => res.json())
      .then((data) => {
        setPools(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load Centrifuge pools:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-12">Loading Centrifuge pools...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {pools.map((pool, idx) => (
        <a
          key={idx}
          href={pool.link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200 flex flex-col space-y-4"
        >
          <h3 className="text-xl font-bold text-gray-900 truncate">{pool.pool_name}</h3>
          <div className="space-y-2">
            {Object.entries(pool.details).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-500">{key}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
} 