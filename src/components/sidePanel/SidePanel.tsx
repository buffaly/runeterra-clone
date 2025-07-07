import DestopSidePanel from "./DestopSidePanel";
import MobileSidePanel from "./MobileSidePanel";
import { useWindowSize } from 'react-use'

interface ISidePanelProps {
    setRegion: (region: string | null) => void;
}

export default function SidePanel({ setRegion }: ISidePanelProps) {
    const { width} = useWindowSize()

    if (width < 768) return <MobileSidePanel setRegion={setRegion} />
    return <DestopSidePanel setRegion={setRegion} />
}