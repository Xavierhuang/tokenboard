import { useEffect, useState } from "react";

type SecuritizeListing = {
  title: string;
  link: string;
  image_url: string;
  tags: string[];
};

export default function SecuritizeListings() {
  const [listings, setListings] = useState<SecuritizeListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/securitize_listings.json")
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load Securitize listings:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-12">Loading Securitize listings...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {listings.map((listing, idx) => (
        <a
          key={idx}
          href={listing.link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200 flex flex-col space-y-4"
        >
          <img
            src={listing.image_url}
            alt={listing.title}
            className="rounded-lg mb-4 w-full h-32 object-cover"
          />
          <div className="font-bold text-lg mb-2">{listing.title}</div>
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag, i) => (
              <span key={i} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{tag}</span>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}
