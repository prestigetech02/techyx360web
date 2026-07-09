export type Testimonial = {
  id: string
  quote: string
  name: string
  role: string
  rating: number
  image: string
}

export const testimonials: Testimonial[] = [
  {
    id: "adaeze-okonkwo",
    quote:
      "I have never been disappointed. High-quality service, consistent communication and customer success every step of the way.",
    name: "Adaeze Okonkwo",
    role: "Founder, ScaleLab Nigeria",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
  },
  {
    id: "tunde-balogun",
    quote:
      "Top-notch service. They go above and beyond to meet expectations. I have stayed loyal for years and will continue to.",
    name: "Tunde Balogun",
    role: "CEO, GoQuick Logistics",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
  },
  {
    id: "fatima-yusuf",
    quote:
      "Fast, reliable, and friendly service every time. I trust them and always recommend them to friends and family.",
    name: "Fatima Yusuf",
    role: "Operations Lead, Edwot Digital",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
  },
  {
    id: "chidi-emeka",
    quote:
      "Techyx360 delivered our mobile app on time and within budget. Their team understood our Nigerian market needs perfectly.",
    name: "Chidi Emeka",
    role: "Director, PassPro Solutions",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80",
  },
  {
    id: "blessing-adeyemi",
    quote:
      "From web development to ongoing support, their professionalism stands out. A dependable IT partner for any business in Lagos.",
    name: "Blessing Adeyemi",
    role: "Managing Director, Artwell Group",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80",
  },
]
