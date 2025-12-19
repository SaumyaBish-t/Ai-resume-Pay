import { generalInfoSchema, generalInfoValues } from "@/lib/validation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { EditorFormProps } from "@/lib/types"
import { useEffect } from "react"



export default function GeneralInfoForm({resumeData,setResumeData}:EditorFormProps) {
    const form = useForm<generalInfoValues>({
        resolver:zodResolver(generalInfoSchema),
        defaultValues: {
            title: resumeData.title || "",
            description: resumeData.description || "",
        },
    });

    useEffect(() => {
            const {unsubscribe}=form.watch(async(values)=>{
                const isValid=await form.trigger();
                if(!isValid) return;
                setResumeData({...resumeData, ...values});
                //Update resume data
            })
            return unsubscribe;
        }, [form,resumeData, setResumeData]);
        
    return <div className="max-w-x1 mx-auto space-y-6">
        <div className="space-y-1.5 text-center">
            <h2 className="text-2xl font-semiboid">General info</h2>
            <p className="text-sm text-muted-foreground">
                This will not appear on  your resume
            </p>
        </div>
        <Form {...form}>
            <form className="space-y-3">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="My cool resume" autoFocus />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="A resume for my next job" autoFocus />
                            </FormControl>
                            <FormDescription>
                                Describe what this resume is for
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            
            </form>
        </Form>

    </div>
}