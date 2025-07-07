export default function Divider() {
    return (
        <div className="relative w-full mb-[30px]">
            <div className="border-t border-[#1e2328] relative top-[6px] mx-[4px]"></div>
            <div className="absolute left-0 top-0 w-2 h-2 border border-[#1e2328] transform translate-y-[0.5px] rotate-45 origin-[0_0]"></div>
            <div className="absolute right-0 top-0 w-2 h-2 border border-[#1e2328] transform translate-y-[0.5px] -rotate-45 origin-[100%_0]"></div>
        </div>
    )
}