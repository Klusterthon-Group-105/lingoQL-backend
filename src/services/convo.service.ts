import * as dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";

const OpenAIKey = process.env.OPENAI_API_KEY;

interface convoPayload {
    message: string;
}

class ConvoService {

    constructor(
        private model =  new ChatOpenAI({ openAIApiKey: OpenAIKey, temperature: 0.9, })
    ){}

    public async convertUserInputToSQL(userInput: convoPayload) {
        const agentPrompt: string = "Given the user's input: {userInput}, generate a well-structured SQL query that effectively captures the user's intent. Provide only the SQL query, ensuring it is suitable for retrieving relevant data from the database."
        try {
            const prompt = PromptTemplate.fromTemplate(agentPrompt);

            const chain = prompt.pipe(this.model);

            const result = await chain.invoke({
                userInput: userInput.message
            });

            return result.content;

        } catch(err:any) {
            console.error(err);
            throw err;
        }
        
    }


}

export default ConvoService;