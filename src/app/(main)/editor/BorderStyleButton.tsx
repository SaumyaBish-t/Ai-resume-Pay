import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import useSubscription from "@/hooks/useSubscription";
import { Circle, Square, Squircle } from "lucide-react";

export const BorderStyles={
    SQUARE:"square",
    CIRCLE:"circle",
    SQUIRCLE:"squircle"
}

const borderStyles=Object.values(BorderStyles)

interface BorderStyleButtonProps{
    borderStyle :string | undefined;
    onChange: (borderStyle: string) => void;
}

export default function BorderStyleButton({
    borderStyle,
    onChange,
}:BorderStyleButtonProps){
    const { canCustomizeDesign } = useSubscription();
    const premiumModal = usePremiumModal();

    function handleClick(){
        if (!canCustomizeDesign()) {
            premiumModal.setOpen(true);
            return;
        }
        
        const currentIndex=borderStyle ? borderStyles.indexOf(borderStyle):0
        const nextIndex=(currentIndex+1)%borderStyles.length
        onChange(borderStyles[nextIndex])
    }

    const Icon=
    borderStyle==="square"
    ? Square: borderStyle==="circle"
    ?Circle
    :Squircle;

    return <Button variant="outline" size="icon" title="Change border style (Premium Plus)"
        onClick={handleClick}>
            <Icon className="size-5" />
    </Button>
}