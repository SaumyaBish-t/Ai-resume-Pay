import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import useSubscription from "@/hooks/useSubscription";
import { ResumeValues } from "@/lib/validation";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { generateSummary } from "./actions";

interface GenerateSummaryButtonProps{
    resumeData:ResumeValues;
    onSummaryGenerated:(summary:string)=>void;
}

export default function GenerateSummaryButton({resumeData,onSummaryGenerated}:GenerateSummaryButtonProps){
    const {toast}=useToast();
    const premiumModal = usePremiumModal();
    const { canUseAI } = useSubscription();
    const [loading,setLoading]=useState(false);

    async function handleClick() {
        if (!canUseAI()) {
            premiumModal.setOpen(true);
            return;
        }
        
        // Premium/Premium Plus users can use AI features
        try{
            setLoading(true)
            const aiResponse=await generateSummary(resumeData);
            onSummaryGenerated(aiResponse)
        }
        catch(error){
            console.error(error);
            toast({
                variant:"destructive",
                description:"Something went wrong.Please try again later."
            })
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <LoadingButton
            variant="outline"
            type="button"
            onClick={handleClick}
            loading={loading}
        >
            <WandSparklesIcon className="size-4" />
        </LoadingButton>
    );
}