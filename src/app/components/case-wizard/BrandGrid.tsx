import type { PhoneBrand } from "@/lib/cases/types";
import BrandPickerTile from "./BrandPickerTile";

type Props = {
  brands: PhoneBrand[];
};

export default function BrandGrid({ brands }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {brands.map((brand) => (
        <BrandPickerTile key={brand.slug} brand={brand} href={`/create/${brand.slug}`} />
      ))}
    </div>
  );
}
