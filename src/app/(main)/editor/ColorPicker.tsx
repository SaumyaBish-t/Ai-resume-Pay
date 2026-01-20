import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import usePremiumModal from "@/hooks/usePremiumModal";
import useSubscription from "@/hooks/useSubscription";
import { PaletteIcon } from "lucide-react";
import { useState } from "react";
import { Color, ColorChangeHandler, TwitterPicker } from "react-color";

interface ColorPickerProps{
    color: Color | undefined;
    onChange: ColorChangeHandler
}

export default function ColorPicker({color,onChange}:ColorPickerProps){
    const [showPopover,setShowPopover]=useState(false)
    const { canCustomizeDesign } = useSubscription();
    const premiumModal = usePremiumModal();

    function handleClick() {
        if (!canCustomizeDesign()) {
            premiumModal.setOpen(true);
            return;
        }
        setShowPopover(true);
    }

    return <Popover open ={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
            <Button 
            variant="outline"
            size="icon"
            title="Change resume color (Premium Plus)"
            onClick={handleClick}>
                <PaletteIcon className="size-5" />
            </Button>
        </PopoverTrigger>
        <PopoverContent
        className="border-none bg-transparent shadow-none"
        align="end">
            <TwitterPicker color={color} onChange={onChange} triangle="top-right"/>
        </PopoverContent>
    </Popover>

}