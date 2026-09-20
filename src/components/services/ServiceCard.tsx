import Image from "next/image";
import Link from "next/link";
import { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  priority?: boolean;
}

export default function ServiceCard({ service, priority = false }: ServiceCardProps) {
  const bookHref = `/book?service=${encodeURIComponent(service.name)}`;

  return (
    <article className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-heading text-purple text-xl font-semibold leading-snug mb-1.5">
          {service.name}
        </h3>
        <p className="font-body text-muted text-sm leading-relaxed flex-1">
          {service.description}
        </p>

        <div className="mt-4">
          <Link
            href={bookHref}
            className="inline-flex items-center justify-center w-full bg-purple text-white font-body text-sm font-medium py-2.5 px-4 rounded-full hover:bg-purple-light active:scale-[0.98] transition-all duration-200"
          >
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}
