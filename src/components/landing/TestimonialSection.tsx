import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
/**
 * Custom star SVG with slightly rounded points but not overly fat.
 */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 1.5l2.94 6.34L22 8.92l-5 4.64L18.18 21 12 17.27 5.82 21 7 13.56l-5-4.64 7.06-1.08L12 1.5z"
        fill={filled ? "#000000" : "rgba(0,0,0,0.1)"}
        stroke={filled ? "#000000" : "none"}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Testimonial data for a single user review.
 */
interface Testimonial {
  name: string;
  role: string;
  stars: number;
  avatar: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Hugo Serrano",
    role: "UC Berkeley '28",
    stars: 5,
    avatar: "",
    content:
      "caltodo saved me this semester. All my bCourses and Gradescope deadlines in one place. I actually stopped missing assignments.",
  },
  {
    name: "Priya Mehta",
    role: "UC Berkeley '26",
    stars: 5,
    avatar: "",
    content:
      "The class chat feature is a game changer. Being able to message classmates right next to my assignments makes studying so much easier.",
  },
  {
    name: "Jason Liu",
    role: "UC Berkeley '28",
    stars: 5,
    avatar: "",
    content:
      "I connected Google Calendar and now every deadline just shows up automatically. I don't have to think about it anymore.",
  },
];

/**
 * Testimonial section displaying a grid of user reviews with star ratings.
 * Used on the landing page below the feature highlights.
 */
export default function TestimonialSection() {
  return (
    <section className="w-full bg-[#FCFCFD] px-6 lg:px-10">
      <div className="py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-[22px] sm:text-[32px] font-medium text-black leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            Ratings and Reviews
          </h2>
          {/* 1 col (xs) → 2 cols (sm ≥640px) → 3 cols (lg ≥1024px) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="bg-white ring-black/10 rounded-2xl border border-transparent p-4 ring-1"
              >
                <div className="flex gap-0.5 mb-1" aria-label={`${t.stars} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < t.stars} />
                  ))}
                </div>

                <p className="text-black my-4">{t.content}</p>

                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="ring-black/10 size-7 border border-transparent shadow ring-1 shrink-0">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback className="bg-[#F5F5F7] text-black/60 text-xs font-medium">{t.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-black text-xs font-medium truncate">{t.name}</div>
                  <span aria-hidden className="bg-black/25 size-1 rounded-full shrink-0" />
                  <span className="text-black/50 text-xs truncate">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
