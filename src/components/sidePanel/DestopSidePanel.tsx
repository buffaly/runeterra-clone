import { getTranslation } from "@/local";
import Divider from "./Divider";
import { motion, Variants } from "motion/react";
import { LanguageDropdown } from "@/components/ui/LanguageDropdown";
import { useLanguage } from "@/local/hook";

interface IDestopSidePanelProps {
    setRegion: (region: string | null) => void;
}

const slideVariants: Variants = {
    initial: { x: "100%" },
    animate: { 
        x: 0,
        transition: {
            type: "spring" as const,
            damping: 20,
            stiffness: 100,
            duration: 0.3
        }
    },
    exit: { 
        x: "110%",
        transition: {
            type: "spring" as const,
            damping: 20,
            stiffness: 100,
            duration: 0.3
        }
    }
};

export default function DestopSidePanel({ setRegion }: IDestopSidePanelProps) {
    const { language, setLanguage } = useLanguage();
    const PANEL_DATA = getTranslation(language);
    return (
        <motion.div 
            className="fixed right-0 bottom-0 w-full h-full max-w-none sm:max-w-[400px] text-[#f0e6d2] flex flex-col"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="flex flex-col w-full h-screen overflow-y-auto">
                <div className="h-full absolute z-[-1]">
                    <svg
                        height="350px" 
                        viewBox="0 0 400 350" 
                        width="400px" 
                        className="block fill-[#010a13] drop-shadow-lg"
                    >
                        <defs>
                            <clipPath id="universe-map0">
                                <polygon points="0,0 400,0 400,350 0,350 0,80 30,50 0,20" />
                            </clipPath>
                        </defs>
                        <polygon points="0,0 400,0 400,350 0,350 0,80 30,50 0,20" />
                        <image
                            clipPath="url(#universe-map0)" 
                            height="350" 
                            width="400" 
                            x="0" 
                            xlinkHref={PANEL_DATA.backgroundImage}
                            y="0" 
                        />
                        <polygon 
                            className="fill-none stroke-[#1e2328] stroke-2" 
                            clipPath="url(#universe-map0)" 
                            points="0,350 0,80 30,50 0,20 0,0" 
                        />
                    </svg>
                    <div className="bg-[#010a13] h-full flex-grow border-l border-[#1e2328] hidden sm:block"></div>
                </div>

                <div className="flex-grow hidden sm:block">
                    <div className="h-full overflow-x-hidden overflow-auto px-10 pt-10 relative">
                        {/* Language Dropdown - Top Right */}
                        <div className="absolute top-4 right-4 z-10">
                            <LanguageDropdown 
                                currentLanguage={language}
                                onLanguageChange={setLanguage}
                            />
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center mb-6">
                                <img 
                                    src={PANEL_DATA.shield}
                                    alt="Region Shield"
                                    className="block flex-shrink-0 h-[60px] mr-[30px]"
                                />
                                <div className="flex-grow">
                                    <h1 className="text-[#f0e6d2] mb-1 font-bold tracking-wider uppercase text-[30px] leading-none font-beaufort">
                                        {PANEL_DATA.name}
                                    </h1>
                                    <div className="text-[#a09b8c] font-bold tracking-wider uppercase text-xs leading-none font-beaufort">
                                        {PANEL_DATA.subtitle}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-hidden mb-7 -mx-1">
                                <div className="flex flex-wrap">
                                    {PANEL_DATA.champions.map((champion, index) => (
                                        <span key={index} className="inline-flex h-[30px] m-1 w-[30px]">
                                            <a
                                                href={champion.url}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="relative bg-[#010a13] border border-[#1e2328] box-border text-[#cdbe91] h-[30px] w-[30px] bg-cover bg-center hover:after:opacity-100 after:absolute after:inset-0 after:border after:border-transparent after:opacity-0 after:transition-opacity after:duration-200 hover:after:border-[#efe5d4] hover:after:border-gradient-to-b hover:after:from-[#efe5d4] hover:after:to-[#c69b4b]"
                                                style={{ 
                                                    backgroundImage: `url("${champion.image}")`,
                                                    backgroundPosition: 'center center',
                                                    backgroundSize: 'cover'
                                                }}
                                            />
                                        </span>
                                    ))}
                                    <button className="inline-flex h-[30px] m-1 w-[30px] bg-[#010a13] border border-[#1e2328] box-border text-[#cdbe91] justify-center items-center text-[10px] font-bold uppercase font-spiegel hover:after:opacity-100">
                                        +4
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <ul className="flex flex-wrap justify-between my-[30px]">
                            {PANEL_DATA.stats.map((stat, index) => (
                                <li key={index} className="box-border flex-shrink-0 flex-grow-0 w-[calc(50%-10px)]">
                                    <h4 className="text-[#a09b8c] mb-1 text-xs leading-[150%] font-spiegel">
                                        {stat.label}
                                    </h4>
                                    <h5 className="text-[#f0e6d2] mb-2 font-bold tracking-wider uppercase text-xs leading-none font-beaufort">
                                        {stat.value}
                                    </h5>
                                </li>
                            ))}
                        </ul>


                        <Divider />

                        <div className="my-[30px]">
                            <div className="text-[#a09b8c] text-sm leading-[150%] font-spiegel mb-0">
                                <p className="leading-[1.8] m-0">
                                    {PANEL_DATA.description}
                                </p>
                            </div>
                            <a 
                                href={PANEL_DATA.learnMoreUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[#0595a9] inline-block mt-[18px] text-sm leading-[150%] font-spiegel no-underline"
                            >
                                {PANEL_DATA.learnMoreText}
                                <svg height="8px" viewBox="0 0 8 8" width="8px" className="inline-block fill-none h-2 ml-1 stroke-[#0595a9] stroke-1 w-2">
                                    <line x1="0" y1="8" x2="8" y2="0"></line>
                                    <polyline points="2 0.5, 7.5 0.5, 7.5 6"></polyline>
                                </svg>
                            </a>
                        </div>

                        <Divider />

                        {/* Featured Section */}
                        <h2 className="text-[#f0e6d2] my-[27px] font-bold tracking-wider uppercase text-base leading-none font-beaufort">
                            {PANEL_DATA.featuredInLabel}
                        </h2>

                        {PANEL_DATA.featuredCards.map((card, index) => (
                            <button 
                                key={index}
                                className="group relative cursor-pointer transform-gpu bg-cover bg-center bg-no-repeat box-border flex flex-col h-[100px] justify-end mb-5 p-5 text-left w-full no-underline hover:after:opacity-100 after:absolute after:inset-0 after:border after:border-transparent after:opacity-0 after:transition-opacity after:duration-200 hover:after:border-[#efe5d4] hover:after:border-gradient-to-b hover:after:from-[#efe5d4] hover:after:to-[#c69b4b]"
                                style={{
                                    backgroundImage: `url("${card.image}")`
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#010a13] via-[rgba(4,12,22,0.81)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                                <h3 className="relative text-[#f0e6d2] mb-2 font-bold tracking-wider uppercase text-base leading-none font-beaufort">
                                    {card.title}
                                </h3>
                                <h4 className="relative text-[#a09b8c] font-bold tracking-wider uppercase text-[10px] leading-none font-beaufort">
                                    {card.subtitle}
                                </h4>
                            </button>
                        ))}

                        <Divider />
                    </div>
                </div>

                {/* Close Button */}
                <div className="absolute top-[50px] left-0 sm:block hidden h-0 w-0 group">
                    <button 
                        onClick={() => setRegion(null)}
                        className="absolute bg-[#010a13] border border-[#1e2328] cursor-pointer h-[26px] w-[26px] transform -translate-x-1/2 -translate-y-1/2 rotate-45"
                        style={{
                            filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.5))'
                        }}
                    />
                    <figure className="absolute pointer-events-none left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="absolute h-1.5 w-0.5 bg-[#cdbe91] group-hover:bg-[#f0e6d2] transition-colors duration-200" 
                                    style={{ 
                                        transform: 'translate(1px, -1px) rotate(135deg)',
                                        transformOrigin: '1px 1px'
                                    }}></div>
                            <div className="absolute h-1.5 w-0.5 bg-[#cdbe91] group-hover:bg-[#f0e6d2] transition-colors duration-200"
                                    style={{ 
                                        transform: 'translate(1px, -1px) rotate(45deg)',
                                        transformOrigin: '1px 1px'
                                    }}></div>
                        </div>
                    </figure>
                </div>
            </div>
        </motion.div>
    );
}