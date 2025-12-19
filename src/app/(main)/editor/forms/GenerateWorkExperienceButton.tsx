import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GenerateWorkExperienceInput, generateWorkExperienceSchema, WorkExperience } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { generateWorkExperience } from "./actions";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/LoadingButton";

interface GenerateWorkExperienceButtonProps{
    onWorkExperienceGenerated:(workExperience:WorkExperience)=> void;
}

export default function GenerateWorkExperience({onWorkExperienceGenerated}:GenerateWorkExperienceButtonProps){
    const [showInputDialog,setShowInputDialog]=useState(false)

    return <>
    <Button
    variant="outline"
    type="button"
    //TODO:BLOCK for non premium users
    onClick={()=> setShowInputDialog(true)}>
        <WandSparklesIcon className="size-4" />
        Smart fill(AI)
    </Button>
    <InputDialog 
    open={showInputDialog}
    onOpenChange={setShowInputDialog}
    onWorkExperienceGenerated={(workExperience)=>{
        onWorkExperienceGenerated(workExperience);
        setShowInputDialog(false);
    }}/>
    </>
}

interface InputDialogProps{
    open:boolean;
    onOpenChange:(open:boolean)=>void;
    onWorkExperienceGenerated:(workExperience:WorkExperience)=> void;

}

function InputDialog({open,onOpenChange,onWorkExperienceGenerated}:InputDialogProps){

    const {toast} =useToast();
    const form =useForm<GenerateWorkExperienceInput>({
        resolver:zodResolver(generateWorkExperienceSchema),
        defaultValues:{
            description:""
        }

    })
    
    async function onSubmit(input:GenerateWorkExperienceInput) {
        try{
            const response=await generateWorkExperience(input);
            onWorkExperienceGenerated(response);
        }
        catch(error){
            console.error(error);
            toast({
                variant:"destructive",
                description:"Something went wrong.Please try again later."
            });
        }        
    }

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Generate work experience
                </DialogTitle>
                <DialogDescription>
                    Describe the work experience and the ai will generare an optimized entry for you.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <div className="space-y-3">
                    <FormField
                    control={form.control}
                    name="description"
                    render={({field})=>(
                        <FormItem>
                            <FormLabel>
                                Description
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                {...field}
                                value={field.value || ""} // Ensure value is never undefined
                                placeholder={`E.g "from nov 2019 to dec 2020 I worked at google as a software engineer, tasks were:" `}
                                autoFocus
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <LoadingButton 
                        type="submit" 
                        loading={form.formState.isSubmitting}
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        Generate
                    </LoadingButton>
                </div>
            </Form>
        </DialogContent>
    </Dialog>
}