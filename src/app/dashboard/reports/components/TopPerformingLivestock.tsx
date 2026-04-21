/* eslint-disable @next/next/no-img-element */
import { Award, Image as ImageIcon } from 'lucide-react'

interface GoatROI {
  id: string
  name_or_tag: string
  breed: string
  total_cost: number
  sale_price: number | null
  profit: number | null
  roi_percentage: number | null
  status: string
  image_url: string | null
}

export function TopPerformingLivestock({ data }: { data: GoatROI[] }) {
  // Only show sold goats with positive profit, limited to top 5
  const performers = data
    .filter(g => g.status === 'sold' && g.profit !== null && g.profit > 0)
    .sort((a, b) => (b.roi_percentage || 0) - (a.roi_percentage || 0))
    .slice(0, 5);

  if (performers.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-lg font-display px-1">Top Performing Livestock</h2>
      <div className="grid grid-cols-1 gap-3">
        {performers.map((goat) => {
          const isGold = (goat.roi_percentage || 0) >= 100;
          const isSilver = (goat.roi_percentage || 0) >= 50 && (goat.roi_percentage || 0) < 100;

          return (
            <div key={goat.id} className="bg-(--color-surface-lowest) p-4 rounded-md shadow-ambient flex items-center justify-between gap-4 border-l-4 border-transparent hover:border-primary transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-(--color-surface-high) overflow-hidden flex-shrink-0 border border-(--color-surface-high)">
                  {goat.image_url ? (
                    <img src={goat.image_url} alt={goat.name_or_tag} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-(--color-on-surface-variant) opacity-30">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{goat.name_or_tag}</h4>
                  <p className="text-[10px] text-(--color-on-surface-variant) uppercase tracking-wider font-medium">{goat.breed || 'Premium Breed'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <span className={`text-lg font-bold ${isGold ? 'text-primary' : isSilver ? 'text-blue-500' : 'text-orange-500'}`}>
                    {goat.roi_percentage?.toFixed(0)}% ROI
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[9px] font-bold uppercase tracking-widest opacity-60">
                  <Award className={`w-3 h-3 ${isGold ? 'text-yellow-500' : isSilver ? 'text-slate-400' : 'text-orange-400'}`} />
                  {isGold ? 'Gold Tier' : isSilver ? 'Silver Tier' : 'Bronze Tier'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
