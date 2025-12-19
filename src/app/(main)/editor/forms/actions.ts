"use server"

import genAI from "@/lib/gemini";
import {GenerateSummaryInput, generateSummarySchema, GenerateWorkExperienceInput, generateWorkExperienceSchema, WorkExperience } from "@/lib/validation";

export async function generateSummary(input: GenerateSummaryInput){
    // TODO: Block for non-premium users

    const {
        jobTitle,workExperiences,educations,skills
    }=generateSummarySchema.parse(input)

    const systemMessage=`
    You are a job resume generator AI. Your task is to write a proffessional introduction summary for a resume given the user's provided data.
    Only return the summary and do not include any other information in the response.Keep it consice and professional
    `

    const userMessage=`
    Please generate a proffessional resume summary from this data:
    Job Title: ${jobTitle || "N/A"}
    Work Experiences: ${workExperiences?.map(exp=>`
        Position:${exp.position || "N/A"} at ${exp.company || "N/A"} from ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}

        Description:
        ${exp.description || "N/A"}

        `,).join("\n\n") }

        Education:
        ${educations?.map((edu)=>`
        Degree:${edu.degree || "N/A"} at ${edu.school || "N/A"} from ${edu.startDate || "N/A"} to ${edu.endDate || "Present"}   
        
        
        `,
    ).join("\n\n")}

    Skills:
    ${skills}
    `;

    const model =genAI.getGenerativeModel({model:"gemini-2.0-flash"});
    const prompt=`${systemMessage}\n\n${userMessage}`;

    const result=await model.generateContent(prompt);
    const response=await result.response;
    const aiResponse=response.text();

     if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }
  return aiResponse;
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
    const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage = `
  You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input.
  Your response must adhere to the following structure. You can omit fields if they can't be inferred from the provided data, but don't add any new ones.

  Job title: <job title>
  Company: <company name>
  Start date: <format: YYYY-MM-DD> (only if provided)
  End date: <format: YYYY-MM-DD> (only if provided)
  Description: <an optimized description in bullet format, might be inferred from the job title>
  `;

  const userMessage = `
  Please provide a work experience entry from this description:
  ${description}
  `;


  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `${systemMessage}\n\n${userMessage}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiResponse = response.text();

  if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }

  console.log("aiResponse", aiResponse);

  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
    
  } satisfies WorkExperience;
}

