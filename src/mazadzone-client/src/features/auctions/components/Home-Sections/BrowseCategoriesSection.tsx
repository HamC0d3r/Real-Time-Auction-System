import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/config/routes.config";

interface CategoryItem {
  id: string;
  name: string; // The display name
  filterValue: string; // The query parameter value for filtering
  imageUrl: string;
  exploreText: string;
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "tech-electronics",
    name: "Tech and Electronics",
    filterValue: "Tech and Electronics",
    imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop",
    exploreText: "Explore Now",
  },
  {
    id: "fashion-style",
    name: "Fashion and Style",
    filterValue: "Fashion and Style",
    imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=400&auto=format&fit=crop",
    exploreText: "Explore Now",
  },
  {
    id: "home-living",
    name: "Home and Living",
    filterValue: "Home and Living",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400&auto=format&fit=crop",
    exploreText: "Explore Now",
  },
  {
    id: "collectible-art",
    name: "Collectible and Art",
    filterValue: "Collectibles and Art", // API category key is plural "Collectibles"
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop",
    exploreText: "Explore Now",
  },
  {
    id: "hobbies-leisure",
    name: "Hobbies and Leisure",
    filterValue: "Hobbies and Leisure",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400&auto=format&fit=crop",
    exploreText: "Explore Now",
  },
  {
    id: "motors",
    name: "Motors",
    filterValue: "Motors",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=400&auto=format&fit=crop",
    exploreText: "Explore Now",
  },
];

export function BrowseCategoriesSection() {
  return (
    <section className="w-full bg-[#EAE8E4] dark:bg-muted/40 py-6 my-0">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-0">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A] dark:text-foreground">
            Browse Categories
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_DATA.map((category) => (
            <Link
              key={category.id}
              href={`${ROUTES.AUCTIONS.LIST}?category=${encodeURIComponent(category.filterValue)}&status=Active`}
              className="group flex items-center justify-between p-4 bg-white dark:bg-card rounded-2xl border border-white dark:border-border/55 hover:border-[#1A1A1A]/10 dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Thumbnail Image Container */}
                <div className="relative w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-xl overflow-hidden bg-muted shrink-0 select-none">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm xs:text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-foreground leading-snug group-hover:text-primary transition-colors duration-200">
                    {category.name}
                  </h3>
                  <span className="inline-block text-[#f97316] font-bold text-xs md:text-sm tracking-wide">
                    {category.exploreText}
                  </span>
                </div>
              </div>

              {/* Action Circle Button */}
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-border/80 flex items-center justify-center text-slate-400 dark:text-muted-foreground group-hover:border-[#1A1A1A] dark:group-hover:border-primary group-hover:bg-[#1A1A1A] dark:group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0 ml-2">
                <ChevronRight className="size-5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
