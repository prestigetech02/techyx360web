import { ServiceCard } from "@/components/cards/service-card"
import { services } from "@/config/services"

export function ServicesGrid() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-20 lg:px-8 lg:pb-24">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {services.map((service) => (
          <ServiceCard key={service.href} {...service} />
        ))}
      </div>
    </div>
  )
}
