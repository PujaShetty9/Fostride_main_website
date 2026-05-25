"use client"

import Image from "next/image"

const companies = [
    {
        name: "Riidl",
        logo: "/images/companies/riidl.png",
    },
    {
        name: "Somaiya Vidyavihar University",
        logo: "/images/companies/somaiya.png",
    },
]

export function Companies() {
    return (
        <section className="py-20 w-full relative">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-unbounded)] text-white text-center mb-16">
                    Companies We Have <span className="text-[#0C8346]">Worked</span> With
                </h2>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    {companies.map((company, index) => (
                        <div
                            key={index}
                            className="relative w-64 h-32 bg-white rounded-2xl flex items-center justify-center p-6 hover:scale-105 transition-transform duration-300 shadow-lg shadow-white/5"
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={company.logo}
                                    alt={company.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
