import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';
import Divider from './Divider';
import { getTranslation } from '@/local';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { useLanguage } from '@/local/hook';

interface IMobileSidePanelProps {
    setRegion: (region: string | null) => void;
}

export default function MobileSidePanel({ setRegion }: IMobileSidePanelProps) {
    const [isFullHeight, setIsFullHeight] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const { language, setLanguage } = useLanguage();
    const PANEL_DATA = getTranslation(language);

    const handleClose = () => {
        if (!isFullHeight) {
            setIsFullHeight(true);
        } else {
            setIsExiting(true);
            setTimeout(() => {
                setRegion(null);
            }, 300);
        }
    };

    return (
        <motion.div 
            className={cn(
                'fixed bottom-0 right-0 w-full text-[#f0e6d2] flex flex-col md:hidden',
                'transition-all duration-300',
                {
                    'h-full': isFullHeight,
                    'h-[228px]': !isFullHeight,
                }
            )}
            initial={{ y: '100%', opacity: 0 }}
            animate={isExiting ? { y: '100%', opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: isExiting ? 0.3 : undefined
            }}
        >
            {/* Background Section */}
            <div className="flex flex-col h-full relative">
                {/* Top Background with SVG */}
                <div className="h-full w-full absolute">
                    <svg
                        width={"535"}
                        height={"468"}
                        viewBox={"0 0 535 468"}
                        className="absolute right-0 w-fit drop-shadow-lg"
                    >
                        {!isFullHeight && (
                            <>
                                <defs>
                                    <clipPath id="universe-map-mobile">
                                        <polygon points={isFullHeight ? "0,0 618,0 648,0 678,0 698,0 698,611 0,611" : "0,0 455,0 485,30 515,0 535,0 535,468 0,468"} />
                                    </clipPath>
                                </defs>
                                <polygon points={isFullHeight ? "0,0 618,0 648,0 678,0 698,0 698,611 0,611" : "0,0 455,0 485,30 515,0 535,0 535,468 0,468"} />
                            </>
                        )}
                        <image
                            clipPath="url(#universe-map-mobile)" 
                            height={"468"} 
                            width={"535"} 
                            x="0" 
                            xlinkHref={PANEL_DATA.backgroundImage}
                            y="0" 
                        />
                        {!isFullHeight && (
                            <polygon 
                                className="fill-none stroke-[#1e2328] stroke-2" 
                                clipPath="url(#universe-map-mobile)" 
                                points={isFullHeight ? "0,0 618,0 648,0 678,0 698,0" : "0,0 455,0 485,30 515,0 535,0"} 
                            />
                        )}
                    </svg>
                    <div className="relative h-full">
                        <div className="bg-[#010a13] absolute top-0 w-[70vw] relative z-[-1] h-[50px] left-0"></div>
                        <div className="bg-[#010a13] relative relative z-[-1] h-full flex-grow"></div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-grow overflow-y-auto">
                    <div className="h-full overflow-x-hidden px-10 pt-10 relative">
                        {/* Language Dropdown - Top Right */}
                        <div className={cn("absolute z-50 transition-all duration-300", {
                            'top-[40px] right-[30px]': !isFullHeight,
                            'top-[115px] right-[30px]': isFullHeight,
                        })}>
                            <LanguageDropdown 
                                currentLanguage={language}
                                onLanguageChange={setLanguage}
                            />
                        </div>
                        {/* Title Section */}
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

                            {/* Champions Section - Mobile Layout */}
                            <div className="overflow-hidden mb-7 -mx-1">
                                <div className="flex flex-wrap">
                                    {PANEL_DATA.champions.map((champion, index) => (
                                        <span key={index} className="inline-flex h-[30px] m-1 w-[30px]">
                                            <a
                                                href={champion.url}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="relative bg-[#010a13] border border-[#1e2328] box-border text-[#cdbe91] h-[30px] w-[30px] bg-cover bg-center hover:after:opacity-100 after:absolute after:inset-0 after:border after:border-transparent after:opacity-0 after:transition-opacity after:duration-200 hover:after:border-[#efe5d4]"
                                                style={{ 
                                                    backgroundImage: `url("${champion.image}")`,
                                                    backgroundPosition: 'center center',
                                                    backgroundSize: 'cover'
                                                }}
                                            />
                                        </span>
                                    ))}
                                    <button className="inline-flex h-[30px] m-1 w-[30px] bg-[#010a13] border border-[#1e2328] box-border text-[#cdbe91] justify-center items-center text-[10px] font-bold uppercase font-spiegel">
                                        +4
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Details - Only show when isFullHeight is true */}
                        {isFullHeight && (
                            <div className="pb-10">
                                
                                <Divider />

                                {/* Stats Section */}
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

                                {/* Description Section */}
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
                                        Learn more about Noxus
                                        <svg height="8px" viewBox="0 0 8 8" width="8px" className="inline-block fill-none h-2 ml-1 stroke-[#0595a9] stroke-1 w-2">
                                            <line x1="0" y1="8" x2="8" y2="0"></line>
                                            <polyline points="2 0.5, 7.5 0.5, 7.5 6"></polyline>
                                        </svg>
                                    </a>
                                </div>

                                
                                <Divider />

                                {/* Featured Section */}
                                <h2 className="text-[#f0e6d2] my-[27px] font-bold tracking-wider uppercase text-base leading-none font-beaufort">
                                    Featured in Noxus
                                </h2>

                                {PANEL_DATA.featuredCards.map((card, index) => (
                                    <button 
                                        key={index}
                                        className="group relative transform-gpu bg-cover bg-center bg-no-repeat box-border flex flex-col h-[100px] justify-end mb-5 p-5 text-left w-full no-underline hover:after:opacity-100 after:absolute after:inset-0 after:border after:border-transparent after:opacity-0 after:transition-opacity after:duration-200 hover:after:border-[#efe5d4]"
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

                                {/* Final Divider */}
                                <div className="relative w-full mb-10">
                                    <div className="border-t border-[#1e2328] mx-[10.6066px]"></div>
                                    <div className="absolute left-0 top-0 w-2 h-2 border border-[#1e2328] transform translate-y-[0.5px] rotate-45 origin-[0_0]"></div>
                                    <div className="absolute right-0 top-0 w-2 h-2 border border-[#1e2328] transform translate-y-[0.5px] -rotate-45 origin-[100%_0]"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Open/Close Button - Mobile */}
                <div className={`absolute top-0 right-[50px] h-0 w-0 group ${isFullHeight ? 'translate-y-[50px]' : ''}`}>
                    <button 
                        onClick={handleClose}
                        className="absolute bg-[#010a13] border border-[#1e2328] cursor-pointer h-[26px] w-[26px] transform -translate-x-1/2 -translate-y-1/2 rotate-45"
                        style={{
                            filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.5))'
                        }}
                    />
                    <figure className="absolute pointer-events-none left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            {/* Arrow Icon - Up when closed, Down when open */}
                            {!isFullHeight ? (
                                <>
                                    <div className="absolute h-1.5 w-0.5 bg-[#cdbe91] group-hover:bg-[#f0e6d2] transition-colors duration-200" 
                                         style={{ 
                                             transform: 'translate(-1px, -3px) rotate(45deg)',
                                             transformOrigin: '1px 1px'
                                         }}></div>
                                    <div className="absolute h-1.5 w-0.5 bg-[#cdbe91] group-hover:bg-[#f0e6d2] transition-colors duration-200"
                                         style={{ 
                                             transform: 'translate(-1px, -3px) rotate(315deg)',
                                             transformOrigin: '1px 1px'
                                         }}></div>
                                </>
                            ) : (
                                <>
                                    <div className="absolute h-1.5 w-0.5 bg-[#cdbe91] group-hover:bg-[#f0e6d2] transition-colors duration-200" 
                                         style={{ 
                                             transform: 'translate(-1px, 1px) rotate(135deg)',
                                             transformOrigin: '1px 1px'
                                         }}></div>
                                    <div className="absolute h-1.5 w-0.5 bg-[#cdbe91] group-hover:bg-[#f0e6d2] transition-colors duration-200"
                                         style={{ 
                                             transform: 'translate(-1px, 1px) rotate(225deg)',
                                             transformOrigin: '1px 1px'
                                         }}></div>
                                </>
                            )}
                        </div>
                    </figure>
                </div>
            </div>
        </motion.div>
    );
}